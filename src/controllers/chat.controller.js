const Chat = require('../models/chat.model');

exports.create = async (req, res) => {
    const chat = new Chat({history :[{role: 'system', content: req.body.content}]});
    try {
        const savedChat = await chat.save();
        return res.status(201).json(savedChat);

    } catch (error) {
        return res
            .status(500)
            .json(error);
    }
}

exports.delete = async (req, res) => {
    const chatId = req.params.id;
    try{
        const chat = await Chat.findByIdAndDelete(chatId);
        if(!chat){
            return res.status(404).json({ message: 'Chat non trouvé' });
        }
        return res
            .status(200)
            .json({ message: 'Chat supprimé avec succès' });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Erreur lors de la suppression du chat" });
    }

}

exports.getOne = async (req, res) => {
    const chatId = req.params.id;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat non trouvé' });
        }

        res.status(200).json(chat);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Erreur lors de la récupération du chat" });
    }
}

exports.getAll = async (req, res) => {

    try {
        const chat = await Chat.find()
        if (!chat) {
            return res.status(404).json({ message: 'Chat non trouvé' });
        }

        res.status(200).json(chat);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Erreur lors de la récupération du chat" });
    }
}

exports.updateOne = async (req, res) => {
    const chatId = req.params.id;
    const history = req.body.history;

    try {
        const chat = await Chat.findByIdAndUpdate(chatId,{$push:{ history:{ $each:history}}}, {new: true});
        if (!chat) {
            return res.status(404).json({ message: 'Chat non trouvé' });
        }

        res.status(200).json(chat);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Erreur lors de la récupération du chat" });
    }
}
