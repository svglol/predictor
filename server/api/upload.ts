import type { UploadApiResponse } from 'cloudinary'

export default defineEventHandler(async (event) => {
  const body = (await readMultipartFormData(event)) as { name: string, filename: string, type: string, data: Buffer }[]

  if (!body || !body.length)
    return { error: 'No file provided' }

  const fileData = body[0]
  const formData = new FormData()
  const blob = new Blob([fileData.data], { type: fileData.type })
  formData.append('file', blob, fileData.filename)
  formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET as string)
  formData.append('folder', process.env.CLOUDINARY_FOLDER as string)
  const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`, {
    method: 'POST',
    body: formData,
  }).then(async res => await res.json())

  if (response.error)
    return { error: response.error.message }

  return response as UploadApiResponse
})
