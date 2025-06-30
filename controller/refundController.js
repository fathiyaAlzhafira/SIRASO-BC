const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Fungsi untuk menangani pengajuan refund
exports.submitRefund = async (req, res) => {
    try {
        // Menyimpan bukti pembayaran
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'File bukti pembayaran harus diupload' });
        }

        const filePath = `/uploads/${file.filename}`;

        // Mendapatkan data dari form, termasuk user_id
        const { user_id, nomor_rekening, nama_bank, alasan, transaction_id } = req.body;

        // Validasi input untuk transaction_id dan user_id
        if (!user_id || !transaction_id) {
            return res.status(400).json({ error: 'user_id dan transaction_id wajib diisi.' });
        }

        // Memastikan user_id dan transaction_id adalah angka valid
        const parsedUserId = parseInt(user_id);
        const parsedTransactionId = parseInt(transaction_id);

        if (isNaN(parsedUserId) || isNaN(parsedTransactionId)) {
            return res.status(400).json({ error: 'user_id dan transaction_id harus berupa angka.' });
        }

        // Membuat record refund request baru
        const newRefundRequest = await prisma.refundRequests.create({
            data: {
                user_id: parsedUserId,  // Menggunakan user_id dari form
                transaction_id: parsedTransactionId,  // Mendapatkan transaction_id dari form
                nomor_rekening,
                nama_bank,
                alasan,
                bukti: filePath,
                status: 'Pending',  // Default status adalah Pending
                tanggal_pengajuan: new Date(),
                // Menyertakan user dan transaction sebagai relasi
                user: {
                    connect: {
                        id: parsedUserId,  // Menghubungkan dengan user berdasarkan id
                    }
                },
                transaction: {
                    connect: {
                        id: parsedTransactionId,  // Menghubungkan dengan transaction berdasarkan transaction_id
                    }
                }
            }
        });

        // Mengirimkan respons berhasil
        res.status(201).json({ message: 'Pengajuan refund berhasil', refundRequest: newRefundRequest });
    } catch (error) {
        console.error(error);
        
        // Menghapus file jika terjadi error
        if (req.file) {
            fs.unlinkSync(path.join(__dirname, '../uploads', req.file.filename)); // Pastikan path file sesuai dengan lokasi Anda
        }

        res.status(500).json({ error: 'Terjadi kesalahan dalam pengajuan refund' });
    }
};
