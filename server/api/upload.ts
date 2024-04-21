import type { UploadApiResponse } from 'cloudinary'
import { getServerSession } from '#auth'
import { authOptions } from '~/server/api/auth/[...]'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event, authOptions)
  if (!session)
    return createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const body = (await readMultipartFormData(event)) as { name: string, filename: string, type: string, data: Buffer }[]

  if (!body || !body.length)
    return createError({ statusCode: 400, statusMessage: 'No file provided' })

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
    return createError({ statusCode: 400, statusMessage: response.error.message })

  return response as UploadApiResponse
})
