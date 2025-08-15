import { supabase } from "@/lib/supabase"

export type DataType = "csv" | "json"

interface UploadDataParams {
  fileName: string
  dataType: DataType
  content: any
  conversationId: string
}

export async function uploadData({ fileName, dataType, content, conversationId }: UploadDataParams) {
  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) throw new Error("No user found")

    // Insert the data
    const { data, error } = await supabase
      .from("uploaded_data")
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        file_name: fileName,
        data_type: dataType,
        content: content,
      })
      .select()
      .single()

    if (error) {
      console.error("Error uploading data:", error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error("Error in uploadData:", error)
    throw error
  }
}

export async function getUploadedData(conversationId: string) {
  try {
    const { data, error } = await supabase
      .from("uploaded_data")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error getting uploaded data:", error)
    throw error
  }
}

export async function deleteUploadedData(id: string) {
  try {
    const { error } = await supabase.from("uploaded_data").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting uploaded data:", error)
    throw error
  }
}
