const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Fetching licenses...');
        const licenses = await prisma.license.findMany();
        console.log('Success:', licenses);
    } catch (error) {
        console.error('Error fetching licenses:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
