import { connectToDatabase } from '../server/db/connection';
import { UserModel } from '../server/db/models';

async function checkUsers() {
  try {
    await connectToDatabase();
    
    const users = await UserModel.find().select('name accessCode role');
    
    console.log(`\n📊 Usuários encontrados: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado no banco de dados!');
      console.log('\nPara criar um usuário administrador inicial, use o endpoint:');
      console.log('POST /api/users');
      console.log('Body: { "name": "Admin", "accessCode": "ADMIN001", "role": "Administrador" }');
    } else {
      users.forEach(user => {
        console.log(`👤 ${user.name}`);
        console.log(`   Cargo: ${user.role}`);
        console.log(`   Código de Acesso: ${user.accessCode}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkUsers();
