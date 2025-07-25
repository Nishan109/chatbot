import { supabase } from "@/lib/supabase"
import Papa from "papaparse"

export type FileType = "csv" | "json" | "png"

interface UploadResult {
  path: string
  fileType: FileType
  parsedData: any
  imageUrl?: string
}

export async function uploadFileToStorage(file: File, conversationId: string): Promise<UploadResult> {
  try {
    // Validate file type
    if (!file.type.match("text/csv|application/json|image/png")) {
      throw new Error("Invalid file type. Please upload CSV, JSON, or PNG files only.")
    }

    // Generate a unique file path
    const fileExt = file.name.split(".").pop()?.toLowerCase()
    const fileName = `${conversationId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from("data_files").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      throw new Error(`File upload failed: ${uploadError.message}`)
    }

    if (!uploadData) {
      throw new Error("File upload failed: No data returned from Supabase")
    }

    // Parse the file content or get image URL
    let parsedData: any
    let imageUrl: string | undefined
    const fileType: FileType = fileExt as FileType

    if (fileType === "csv") {
      parsedData = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            if (results.errors && results.errors.length > 0) {
              reject(new Error(`Error parsing CSV file: ${results.errors[0].message}`))
            } else {
              resolve(results.data)
            }
          },
          error: (error) => reject(new Error(`CSV parsing error: ${error.message}`)),
        })
      })
    } else if (fileType === "json") {
      const text = await file.text()
      try {
        parsedData = JSON.parse(text)
      } catch (error) {
        throw new Error("Invalid JSON format")
      }
    } else if (fileType === "png") {
      const { data: urlData } = supabase.storage.from("data_files").getPublicUrl(filePath)
      imageUrl = urlData.publicUrl
      parsedData = { imageUrl }
    }

    return {
      path: uploadData.path,
      fileType,
      parsedData,
      imageUrl,
    }
  } catch (error) {
    console.error("Error in uploadFileToStorage:", error)
    throw error
  }
}

export async function getFileFromStorage(path: string): Promise<{ data: any; fileType: FileType }> {
  try {
    // Download the file
    const { data, error } = await supabase.storage.from("data_files").download(path)

    if (error) throw error
    if (!data) throw new Error("No data found")

    // Determine file type from path
    const fileType = path.split(".").pop()?.toLowerCase() as FileType

    // Parse the file content or get image URL
    let parsedData: any

    if (fileType === "csv") {
      const text = await data.text()
      parsedData = await new Promise((resolve, reject) => {
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              reject(new Error("Error parsing CSV file"))
            } else {
              resolve(results.data)
            }
          },
          error: (error) => reject(error),
        })
      })
    } else if (fileType === "json") {
      const text = await data.text()
      parsedData = JSON.parse(text)
    } else if (fileType === "png") {
      const { data: urlData } = supabase.storage.from("data_files").getPublicUrl(path)
      parsedData = { imageUrl: urlData.publicUrl }
    }

    return {
      data: parsedData,
      fileType,
    }
  } catch (error) {
    console.error("Error downloading file:", error)
    throw error
  }
}

export async function deleteFileFromStorage(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from("data_files").remove([path])

    if (error) throw error
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}
