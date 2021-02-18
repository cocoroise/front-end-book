const http = require("http")
const spawn = require("child_process").spawn
const createHandler = require("github-webhook-handler")
const handler = createHandler({
	path: "/",
	secret: "book"
})

http.createServer((req, res) => {
	handler(req, res, function(err) {
		res.statusCode = 404
		res.end("yes sir!")
	})
}).listen(7777)

handler.on("push", e => {
	try {
		const s = spawn("sh", ["auto_build.sh"])
		s.stdout.on("data", data => {
			console.log(`${e.payload.repository.name}: ${data}`)
		})
		s.stderr.on("data", data => {
			console.log(`${e.payload.repository.name}: ${data}`)
		})
		s.on("error", err => {
			console.log("进程启动失败", err)
		})
		s.on("close", data => {
			console.log("进程正在退出", data)
		})
		console.log(e.payload.repository.name, "has rebuild")
	} catch (err) {
		console.log("push event error-->", err)
	}
})
