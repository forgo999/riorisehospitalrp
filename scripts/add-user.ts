import { connectToDatabase } from '../server/db/connection';
import { UserModel, ShiftModel } from '../server/db/models';

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('❌ Uso: npm run add-user <nome> <codigo> <cargo> [turno-id]');
  console.log('\nCargos disponíveis:');
  console.log('  - estagiario');
  console.log('  - paramedico');
  console.log('  - terapeuta');
  console.log('  - cirurgiao');
  console.log('  - vice_diretor');
  console.log('  - diretor');
  console.log('  - administrador');
  console.log('\nExemplo: npm run add-user "João Silva" 3850 paramedico');
  process.exit(1);
}

const [name, accessCode, role, shiftId] = args;

async function addUser() {
  try {
    await connectToDatabase();
    
    // Verificar se código já existe
    const existing = await UserModel.findOne({ accessCode });
    if (existing) {
      console.log(`❌ Código ${accessCode} já está em uso por ${existing.name}`);
      process.exit(1);
    }
    
    // Validar cargo
    const validRoles = ['estagiario', 'paramedico', 'terapeuta', 'cirurgiao', 'vice_diretor', 'diretor', 'administrador'];
    if (!validRoles.includes(role)) {
      console.log(`❌ Cargo inválido: ${role}`);
      console.log('Cargos válidos:', validRoles.join(', '));
      process.exit(1);
    }
    
    // Criar usuário
    const user = await UserModel.create({
      name,
      accessCode,
      role,
      shiftId: shiftId || null,
      isChiefSurgeon: false
    });
    
    console.log('✅ Usuário criado com sucesso!\n');
    console.log(`👤 Nome: ${name}`);
    console.log(`🔑 Código: ${accessCode}`);
    console.log(`💼 Cargo: ${role}`);
    if (shiftId) {
      const shift = await ShiftModel.findById(shiftId);
      console.log(`⏰ Turno: ${shift?.name || shiftId}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

addUser();
