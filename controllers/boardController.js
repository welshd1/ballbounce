exports.getAllBoards = (req, res) => {
    console.log('reached');
    res.status(200).json([
        { id: 1, name: "Hello" },
        { id: 2, name: "World" }
    ]);
};
