import express, { Request, Response } from 'express'
import fs from'fs'
import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import readline from 'readline'
import path from 'path'

const server = express()

// The ./temp folder will be deleted every day by the cron job
const DOWNLOAD_DIRECTORY = './temp'

// Handle the audio download. Return link or error
async function downloadAudio(link: string){
    // Verify if the the DOWNLOAD_TEMP_DIRECTORY exists OR try to create it
    if(!fs.existsSync(DOWNLOAD_DIRECTORY)){
        try{
            fs.mkdirSync(DOWNLOAD_DIRECTORY)
        }catch(e){
            return new Error('Unable to create directory')
        }
    }

    const videoInfo = await ytdl.getInfo(link)
    const videotitle = videoInfo.videoDetails.title.toString()
    const safeVideoTitle = videotitle.replace(/[^\w\s]/g, '')

    const downloadStream = ytdl.downloadFromInfo(videoInfo, {quality: 'highestaudio'})

    ffmpeg(downloadStream)
    .audioBitrate(128)
    .save(`${DOWNLOAD_DIRECTORY}/${safeVideoTitle}.mp3`)
    .on('progress', p => {
        readline.cursorTo(process.stdout, 0)
        process.stdout.write(`${p.targetSize}kb \n`);
    })
    .on('end', () => {
        console.log('downloaded')
    })

    return  `${safeVideoTitle}`
}

server.get('/', (req: Request, res: Response) => {
    const {link} = req.query
    const audioDownloader = downloadAudio(link as string)

    if(audioDownloader instanceof Error){
        res.status(400).send(audioDownloader.message)
    }else{
        const soundLink = audioDownloader.then((data) => {
            const link = `http://localhost:3333/temp/${encodeURIComponent(data.toString())}.mp3`
            res.json(link)
        })
    }
})

// Expose the /temp folder as an static URL
server.use('/temp', express.static(path.join(__dirname, '..', 'temp')))
server.use(express.json())
server.listen(3333)
