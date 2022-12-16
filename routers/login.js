const router = require('express').Router()

router.get('/success', (req, res) => {
    try {
        const data = req.session
        console.log("sessionData : " + JSON.stringify(data))
        res.status(200).json(data)
    } catch(error) {
        res.status(403).json("User not found")
    }
})

module.exports = router