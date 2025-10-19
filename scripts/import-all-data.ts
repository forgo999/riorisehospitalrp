import { readFileSync } from 'fs';
import { connectToDatabase } from '../server/db/connection';
import { 
  UserModel, 
  ShiftModel, 
  CovenantModel, 
  RuleModel, 
  MeCommandModel, 
  AttendanceRecordModel,
  WarningModel 
} from '../server/db/models';

async function importAllData() {
  try {
    await connectToDatabase();
    console.log('🚀 Importando TODOS os dados da pasta data/...\n');

    // 1. LIMPAR DADOS ANTIGOS (OPCIONAL - comentado para não perder dados)
    // await UserModel.deleteMany({});
    // await ShiftModel.deleteMany({});
    // console.log('🗑️  Dados antigos removidos\n');

    // 2. IMPORTAR TURNOS
    console.log('📅 Importando turnos...');
    const shiftsData = JSON.parse(readFileSync('./data/shifts.json', 'utf-8'));
    const shiftIdMap = new Map(); // Mapear IDs antigos para novos
    
    for (const shift of shiftsData) {
      const { id: oldId, ...shiftData } = shift;
      const existing = await ShiftModel.findOne({ name: shift.name });
      
      if (!existing) {
        const newShift = await ShiftModel.create(shiftData);
        shiftIdMap.set(oldId, newShift._id.toString());
        console.log(`  ✓ Turno criado: ${shift.name}`);
      } else {
        shiftIdMap.set(oldId, existing._id.toString());
        console.log(`  ⏭️  Turno já existe: ${shift.name}`);
      }
    }

    // 3. IMPORTAR USUÁRIOS
    console.log('\n👥 Importando usuários...');
    const usersData = JSON.parse(readFileSync('./data/users.json', 'utf-8'));
    const userIdMap = new Map(); // Mapear IDs antigos para novos
    
    for (const user of usersData) {
      const { id: oldId, ...userData } = user;
      
      // Mapear role "membro" para "estagiario" se necessário
      if (userData.role === 'membro') {
        userData.role = 'estagiario';
      }
      
      // Converter shiftId antigo para novo
      if (userData.shiftId && shiftIdMap.has(userData.shiftId)) {
        userData.shiftId = shiftIdMap.get(userData.shiftId);
      }
      
      const existing = await UserModel.findOne({ accessCode: user.accessCode });
      
      if (!existing) {
        const newUser = await UserModel.create(userData);
        userIdMap.set(oldId, newUser._id.toString());
        console.log(`  ✓ Usuário criado: ${user.name} (${user.accessCode})`);
      } else {
        userIdMap.set(oldId, existing._id.toString());
        console.log(`  ⏭️  Usuário já existe: ${user.name}`);
      }
    }

    // 4. ATUALIZAR VICE-DIRETORES NOS TURNOS
    console.log('\n🔄 Atualizando vice-diretores...');
    for (const shift of shiftsData) {
      const oldViceId = shift.viceDirectorId;
      if (oldViceId && userIdMap.has(oldViceId)) {
        const newViceId = userIdMap.get(oldViceId);
        const newShiftId = shiftIdMap.get(shift.id);
        
        if (newShiftId) {
          await ShiftModel.findByIdAndUpdate(newShiftId, { viceDirectorId: newViceId });
          console.log(`  ✓ Vice-diretor atualizado para turno ${shift.name}`);
        }
      }
    }

    // 5. IMPORTAR CONVÊNIOS
    console.log('\n🤝 Importando convênios...');
    const covenantsData = JSON.parse(readFileSync('./data/covenants.json', 'utf-8'));
    for (const covenant of covenantsData) {
      const { id, ...covenantData } = covenant;
      const existing = await CovenantModel.findOne({ organizationName: covenant.organizationName });
      
      if (!existing) {
        await CovenantModel.create(covenantData);
        console.log(`  ✓ Convênio criado: ${covenant.organizationName}`);
      } else {
        console.log(`  ⏭️  Convênio já existe: ${covenant.organizationName}`);
      }
    }

    // 6. IMPORTAR REGRAS
    console.log('\n📋 Importando regras...');
    const rulesData = JSON.parse(readFileSync('./data/rules.json', 'utf-8'));
    for (const rule of rulesData) {
      const { id, ...ruleData } = rule;
      
      // Converter shiftId se necessário
      if (ruleData.shiftId && shiftIdMap.has(ruleData.shiftId)) {
        ruleData.shiftId = shiftIdMap.get(ruleData.shiftId);
      }
      
      await RuleModel.create(ruleData);
      console.log(`  ✓ Regra criada: ${rule.title}`);
    }
    
    if (rulesData.length === 0) {
      console.log('  ⏭️  Nenhuma regra para importar');
    }

    // 7. IMPORTAR COMANDOS /ME
    console.log('\n💬 Importando comandos /me...');
    const meCommandsData = JSON.parse(readFileSync('./data/me-commands.json', 'utf-8'));
    for (const command of meCommandsData) {
      const { id, ...commandData } = command;
      
      // Converter shiftId se necessário
      if (commandData.shiftId && shiftIdMap.has(commandData.shiftId)) {
        commandData.shiftId = shiftIdMap.get(commandData.shiftId);
      }
      
      await MeCommandModel.create(commandData);
      console.log(`  ✓ Comando criado: ${command.text}`);
    }
    
    if (meCommandsData.length === 0) {
      console.log('  ⏭️  Nenhum comando para importar');
    }

    // 8. IMPORTAR PRESENÇA
    console.log('\n📊 Importando registros de presença...');
    const attendanceData = JSON.parse(readFileSync('./data/attendance.json', 'utf-8'));
    for (const record of attendanceData) {
      const { id, ...recordData } = record;
      
      // Converter IDs se necessário
      if (recordData.userId && userIdMap.has(recordData.userId)) {
        recordData.userId = userIdMap.get(recordData.userId);
      }
      if (recordData.shiftId && shiftIdMap.has(recordData.shiftId)) {
        recordData.shiftId = shiftIdMap.get(recordData.shiftId);
      }
      
      await AttendanceRecordModel.create(recordData);
      console.log(`  ✓ Presença registrada`);
    }
    
    if (attendanceData.length === 0) {
      console.log('  ⏭️  Nenhum registro de presença para importar');
    }

    // 9. IMPORTAR ADVERTÊNCIAS
    console.log('\n⚠️  Importando advertências...');
    const warningsData = JSON.parse(readFileSync('./data/warnings.json', 'utf-8'));
    for (const warning of warningsData) {
      const { id, ...warningData } = warning;
      
      // Converter IDs se necessário
      if (warningData.userId && userIdMap.has(warningData.userId)) {
        warningData.userId = userIdMap.get(warningData.userId);
      }
      if (warningData.issuedBy && userIdMap.has(warningData.issuedBy)) {
        warningData.issuedBy = userIdMap.get(warningData.issuedBy);
      }
      
      await WarningModel.create(warningData);
      console.log(`  ✓ Advertência importada`);
    }
    
    if (warningsData.length === 0) {
      console.log('  ⏭️  Nenhuma advertência para importar');
    }

    // RESUMO
    console.log('\n' + '='.repeat(60));
    console.log('✨ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!\n');
    
    const users = await UserModel.find();
    const shifts = await ShiftModel.find();
    const covenants = await CovenantModel.find();
    
    console.log(`📊 Total de usuários: ${users.length}`);
    console.log(`📅 Total de turnos: ${shifts.length}`);
    console.log(`🤝 Total de convênios: ${covenants.length}`);
    
    console.log('\n🔑 Códigos de acesso disponíveis:\n');
    for (const user of users) {
      console.log(`   ${user.accessCode.padEnd(20)} - ${user.name}`);
    }
    
    console.log('\n' + '='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

importAllData();
