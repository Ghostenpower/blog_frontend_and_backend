const Moment = require('../models/Moment');

// 获取所有动态
exports.getMoments = async (req, res) => {
  try {
    const moments = await Moment.find().sort({ date: -1 });
    res.json(moments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个动态
exports.getMomentById = async (req, res) => {
  try {
    const moment = await Moment.findById(req.params.id);
    if (!moment) {
      return res.status(404).json({ message: '动态不存在' });
    }
    res.json(moment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 创建动态
exports.createMoment = async (req, res) => {
  try {
    const moment = new Moment(req.body);
    const savedMoment = await moment.save();
    res.status(201).json(savedMoment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 更新动态
exports.updateMoment = async (req, res) => {
  try {
    const moment = await Moment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!moment) {
      return res.status(404).json({ message: '动态不存在' });
    }
    res.json(moment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 删除动态
exports.deleteMoment = async (req, res) => {
  try {
    const moment = await Moment.findByIdAndDelete(req.params.id);
    if (!moment) {
      return res.status(404).json({ message: '动态不存在' });
    }
    res.json({ message: '动态已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 点赞/取消点赞动态
exports.likeMoment = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: '动态ID不能为空' });
    }
    
    const moment = await Moment.findById(req.params.id);
    if (!moment) {
      return res.status(404).json({ message: '动态不存在' });
    }
    
    // 检查请求体中的isLiked字段，决定是点赞还是取消点赞
    const { isLiked } = req.body;
    
    if (isLiked) {
      moment.likes += 1;
    } else {
      // 确保likes不会小于0
      moment.likes = Math.max(0, moment.likes - 1);
    }
    
    await moment.save();
    
    res.json(moment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 添加评论到动态
exports.addComment = async (req, res) => {
  try {
    const { content, author } = req.body;
    
    if (!content || !author) {
      return res.status(400).json({ message: '评论内容和作者不能为空' });
    }
    
    const moment = await Moment.findById(req.params.id);
    if (!moment) {
      return res.status(404).json({ message: '动态不存在' });
    }
    
    const newComment = {
      content,
      author,
      date: new Date()
    };
    
    moment.comments.push(newComment);
    await moment.save();
    
    res.status(201).json(moment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取动态的所有评论
exports.getComments = async (req, res) => {
  try {
    const moment = await Moment.findById(req.params.id);
    if (!moment) {
      return res.status(404).json({ message: '动态不存在' });
    }
    
    res.json(moment.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 删除评论
exports.deleteComment = async (req, res) => {
  try {
    const moment = await Moment.findById(req.params.id);
    if (!moment) {
      return res.status(404).json({ message: '动态不存在' });
    }
    
    const commentIndex = moment.comments.findIndex(
      comment => comment._id.toString() === req.params.commentId
    );
    
    if (commentIndex === -1) {
      return res.status(404).json({ message: '评论不存在' });
    }
    
    moment.comments.splice(commentIndex, 1);
    await moment.save();
    
    res.json({ message: '评论已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 