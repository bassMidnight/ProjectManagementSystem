const mongoose = require('mongoose');

// สร้าง Schema สำหรับ Skill
const skillSchema = new mongoose.Schema({
    id: String,
    name: String,
    description: String
}, { timestamps: true });

skillSchema.pre('save', async function (next) {
    if (!this.isNew) return next();

    const namePrefix = this.name.slice(0, 4).toUpperCase();

    const lastSkill = await mongoose.model('Skill').findOne({ id: { $regex: `^${namePrefix}` } })
        .sort({ createdAt: -1 })
        .exec();
    
    let nextNumber = 1;

    if (lastSkill) {
        const lastIdNumber = parseInt(lastSkill.id.slice(4), 10);
        nextNumber = lastIdNumber + 1;
    }

    this.id = `${namePrefix}${nextNumber.toString().padStart(4, '0')}`;

    next();
});

module.exports = mongoose.model('Skill', skillSchema);