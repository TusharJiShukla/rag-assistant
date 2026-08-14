"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

let fileSearchStoreName = null;

export async function createFileSearchStore() {
  try {
    if (!fileSearchStoreName) {
      const fileSearchStore = await ai.fileSearchStores.create({
        config: { displayName: "rag-file-store" },
      });
      fileSearchStoreName = fileSearchStore.name || null;
    }
    return { success: true, storeName: fileSearchStoreName };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function uploadFile(formData) {
  try {
    const file = formData.get("file");
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (!fileSearchStoreName) {
      const storeResult = await createFileSearchStore();
      if (!storeResult.success || !storeResult.storeName) {
        return { success: false, error: storeResult.error || "Failed to create file store" };
      }
      fileSearchStoreName = storeResult.storeName;
    }

    const operation = await ai.fileSearchStores.uploadToFileSearchStore({
      file: file,
      fileSearchStoreName: fileSearchStoreName,
      config: {
        displayName: file.name,
      },
    });

    // Wait until import is complete
    let currentOperation = operation;
    while (!currentOperation.done) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      currentOperation = await ai.operations.get({ operation: currentOperation });
    }

    return { success: true, message: "File uploaded successfully" };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function askQuestion(history) {
  try {
    if (!fileSearchStoreName) {
      return { success: false, error: "No file store found. Please upload a file first." };
    }

    const formattedContents = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: formattedContents,
      config: {
        systemInstruction: "You are a specialized document QA assistant. You must ONLY answer questions based on the provided document. Do NOT use outside knowledge. If the answer is not in the document, explicitly state 'I cannot answer this based on the provided document.'",
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [fileSearchStoreName],
            },
          },
        ],
      },
    });

    return { success: true, answer: response.text };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
