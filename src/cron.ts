import fs from 'fs'
import cron from 'node-cron'

const path = "./temp"
const fourAMJobSchedule = "0 4 * * *"

function cleanAllTempFiles(){
    fs.rm(path, { recursive: true}, (error) => {
        if(error){
            throw new Error('Error while MAKING temp folder')
        }else{
            console.log('Folder deleted successfully... rebuilding it')
            fs.mkdir(path, {recursive: true}, (error) => {
                if(error){
                    throw new Error('Error while MAKING temp folder')
                }
                else{
                    console.log('Temp fouder rebuild')
                }
            })
        }
    })
}

// Will run everyday at 04 A.M.
cron.schedule(fourAMJobSchedule, cleanAllTempFiles)
