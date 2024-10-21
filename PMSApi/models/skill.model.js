const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

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

skillSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Skill', skillSchema);