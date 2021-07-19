import { pipeline, Readable, Writable, Transform } from "stream"
import { promisify } from "util"
import { createWriteStream } from "fs"
const pipelineAsync = promisify(pipeline)
{
    const readableStream = Readable({
        read: function () {
            this.push("Hello dude")
            this.push("Eai")
            this.push("vlw!")
            this.push("\n")
            this.push(null)
        }
    })
    const writableStream = Writable({
        write(chunk, encoding, cb) {
            console.log(chunk)
            cb()
        }
    })
    await pipelineAsync(readableStream, writableStream)

    console.log("exit process 01")
}
{
    const writableMapToCSV = Transform({
        transform(chunk, encoding, cb) {
            const data = JSON.parse(chunk)
            const result = `${data.id},${data.name.toUpperCase()}\n`
            cb(null, result)
        }
    })
    const setHeader = Transform({
        transform(chunk, encoding, cb) {
            this.counter = this.counter ?? 0
            if (this.counter) {
                return cb(null, chunk)
            }
            this.counter += 1
            cb(null, 'id,name\n'.concat(chunk))


        }
    })
    const readableStream = Readable({
        read() {
            for (let index = 0; index < 1e5; index++) {
                const person = { id: Date.now() + index, name: `Bruno-${index}` }
                const data = JSON.stringify(person)
                this.push(data)
            }
            this.push(null)
        }
    })

    await pipelineAsync(readableStream, writableMapToCSV, setHeader, createWriteStream("my.csv"))
}


