import { v2 as cloudinary } from 'cloudinary'
import type { UploadApiResponse } from 'cloudinary'
import { createReadStream } from 'streamifier'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export default defineEventHandler(async (event) => {
  const body = (await readMultipartFormData(event)) as {
    name: string
    filename: string
    type: string
    data: Buffer
  }[]
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER,
      },
      (error, result) => {
        if (error)
          return reject(error)
        if (result)
          return resolve(result)
      },
    )
    createReadStream(body[0].data).pipe(stream)
  })
})
