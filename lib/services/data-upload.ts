export async function uploadFile(file: File) {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Upload failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}
