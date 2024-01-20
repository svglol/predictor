import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import type { UploadApiResponse } from 'cloudinary'
import streamifier from 'streamifier'
import { IncomingMessage, ServerResponse } from 'http'
const storage = multer.memoryStorage()
const upload = multer({ storage })

const uploadMiddleware = upload.single('file')
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

function runMiddleware(
  req: IncomingMessage & { originalUrl?: string | undefined },
  res: ServerResponse<IncomingMessage>,
  fn: (arg0: any, arg1: any, arg2: (result: any) => void) => void
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export default defineEventHandler(async (event): Promise<UploadApiResponse> => {
  await runMiddleware(event.node.req, event.node.res, uploadMiddleware)
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER,
      },
      (error, result) => {
        if (error) return reject(error)
        if (result) return resolve(result)
      }
    )
    //@ts-ignore
    streamifier.createReadStream(event.node.req.file.buffer).pipe(stream)
  })
})
