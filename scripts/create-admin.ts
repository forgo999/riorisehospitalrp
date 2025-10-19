import { connectToDatabase } from '../server/db/connection';
import { UserModel } from '../server/db/models';

async function createAdmin() {
  try {
    await connectToDatabase();
    
    // Verificar se já existe um admin
    const existingAdmin = await UserModel.findOne({ role: 'Administrador' });
    
    if (existingAdmin) {
      console.log('✅ Já existe um administrador no sistema:');
      console.log(`   Nome: ${existingAdmin.name}`);
      console.log(`   Código de Acesso: ${existingAdmin.accessCode}`);
      process.exit(0);
    }
    
    // Criar admin inicial
    const admin = await UserModel.create({
      name: 'Administrador',
      accessCode: 'ADMIN001',
      role: 'administrador',
      shiftId: null,
      narniaName: '',
      phone: '',
      isChiefSurgeon: false
    });
    
    console.log('✅ Administrador criado com sucesso!\n');
    console.log('👤 Nome: Administrador');
    console.log('🔑 Código de Acesso: ADMIN001');
    console.log('💼 Cargo: Administrador\n');
    console.log('Use este código para fazer login no sistema.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error);
    process.exit(1);
  }
}

createAdmin();
