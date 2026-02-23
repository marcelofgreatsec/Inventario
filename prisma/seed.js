const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 1. Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@fgreat.com' },
        update: {},
        create: {
            name: 'Admin TI',
            email: 'admin@fgreat.com',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log('Seed: User admin created');

    // 2. Create Initial Assets
    const assetData = [
        { id: 'AST-001', name: 'SRV-PROD-01', type: 'Servidor', location: 'Datacentre A', status: 'Ativo', ip: '192.168.1.10' },
        { id: 'AST-002', name: 'SW-CORE-01', type: 'Rede', location: 'Datacentre A', status: 'Ativo', ip: '192.168.1.1' },
        { id: 'AST-003', name: 'NB-TI-04', type: 'Notebook', location: 'Escritório', status: 'Manutenção', ip: '192.168.1.45' },
        { id: 'AST-004', name: 'SRV-BACKUP-02', type: 'Servidor', location: 'Datacentre B', status: 'Ativo', ip: '192.168.2.10' },
        { id: 'AST-005', name: 'PC-MKT-01', type: 'Desktop', location: 'Escritório', status: 'Desativado', ip: '192.168.1.101' },
        { id: 'AST-006', name: 'STG-PRIMARY', type: 'Storage', location: 'Datacentre A', status: 'Ativo', ip: '192.168.1.50' },
    ];

    for (const asset of assetData) {
        await prisma.asset.upsert({
            where: { id: asset.id },
            update: {},
            create: asset,
        });
    }

    console.log('Seed: Assets created');

    // 3. Create Initial Backup Routines
    const routineData = [
        { name: 'Backup Diário - SQL Prod', type: 'Nuvem', frequency: 'Diário (02:00)', status: 'Sucesso', responsible: 'João Silva' },
        { name: 'Arquivos - Storage Local', type: 'Local', frequency: 'Horário', status: 'Sucesso', responsible: 'Sistema' },
        { name: 'Offsite - S3 Mirror', type: 'Híbrido', frequency: 'Semanal', status: 'Erro', responsible: 'Maria Souza' },
    ];

    for (const routine of routineData) {
        await prisma.backupRoutine.create({ data: routine });
    }

    console.log('Seed: Backup routines created');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
