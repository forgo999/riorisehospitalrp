import { connectToDatabase } from '../server/db/connection';
import { UserModel, ShiftModel, CovenantModel } from '../server/db/models';

async function setupDatabase() {
  try {
    await connectToDatabase();
    console.log('🚀 Configurando banco de dados...\n');

    // 1. Criar Turnos
    console.log('📅 Criando turnos...');
    
    const turnoManha = await ShiftModel.findOne({ name: 'Turno Manhã' });
    if (!turnoManha) {
      await ShiftModel.create({
        name: 'Turno Manhã',
        viceDirectorId: 'temp',
        password: 'manha123',
        createdAt: new Date().toISOString()
      });
      console.log('  ✓ Turno Manhã criado');
    } else {
      console.log('  ⏭️  Turno Manhã já existe');
    }

    const turnoTarde = await ShiftModel.findOne({ name: 'Turno Tarde' });
    if (!turnoTarde) {
      await ShiftModel.create({
        name: 'Turno Tarde',
        viceDirectorId: 'temp',
        password: 'tarde123',
        createdAt: new Date().toISOString()
      });
      console.log('  ✓ Turno Tarde criado');
    } else {
      console.log('  ⏭️  Turno Tarde já existe');
    }

    const turnoNoite = await ShiftModel.findOne({ name: 'Turno Noite' });
    if (!turnoNoite) {
      await ShiftModel.create({
        name: 'Turno Noite',
        viceDirectorId: 'temp',
        password: 'noite123',
        createdAt: new Date().toISOString()
      });
      console.log('  ✓ Turno Noite criado');
    } else {
      console.log('  ⏭️  Turno Noite já existe');
    }

    // Buscar turnos criados
    const shifts = await ShiftModel.find();
    const manhaShift = shifts.find(s => s.name === 'Turno Manhã');
    const tardeShift = shifts.find(s => s.name === 'Turno Tarde');
    const noiteShift = shifts.find(s => s.name === 'Turno Noite');

    // 2. Criar Administrador
    console.log('\n👑 Criando administrador...');
    const admin = await UserModel.findOne({ accessCode: 'ADMIN001' });
    if (!admin) {
      await UserModel.create({
        name: 'Administrador',
        accessCode: 'ADMIN001',
        role: 'administrador',
        shiftId: null,
        isChiefSurgeon: false
      });
      console.log('  ✓ Administrador criado (Código: ADMIN001)');
    } else {
      console.log('  ⏭️  Administrador já existe');
    }

    // 3. Criar Diretor
    console.log('\n👔 Criando diretor...');
    const diretor = await UserModel.findOne({ accessCode: 'DIR001' });
    if (!diretor) {
      await UserModel.create({
        name: 'Dr. Carlos Silva',
        accessCode: 'DIR001',
        role: 'diretor',
        shiftId: null,
        isChiefSurgeon: false,
        narniaName: 'Dr. Carlos',
        phone: '(11) 98888-1111'
      });
      console.log('  ✓ Diretor criado (Código: DIR001)');
    } else {
      console.log('  ⏭️  Diretor já existe');
    }

    // 4. Criar Vice Diretores para cada turno
    console.log('\n🎖️  Criando vice-diretores...');
    
    if (manhaShift) {
      const viceManha = await UserModel.findOne({ accessCode: 'VICE001' });
      if (!viceManha) {
        const vice = await UserModel.create({
          name: 'Dra. Ana Santos',
          accessCode: 'VICE001',
          role: 'vice_diretor',
          shiftId: manhaShift._id.toString(),
          isChiefSurgeon: false,
          narniaName: 'Dra. Ana',
          phone: '(11) 98888-2222'
        });
        await ShiftModel.findByIdAndUpdate(manhaShift._id, { viceDirectorId: vice._id.toString() });
        console.log('  ✓ Vice-Diretor Manhã criado (Código: VICE001)');
      } else {
        console.log('  ⏭️  Vice-Diretor Manhã já existe');
      }
    }

    if (tardeShift) {
      const viceTarde = await UserModel.findOne({ accessCode: 'VICE002' });
      if (!viceTarde) {
        const vice = await UserModel.create({
          name: 'Dr. Roberto Lima',
          accessCode: 'VICE002',
          role: 'vice_diretor',
          shiftId: tardeShift._id.toString(),
          isChiefSurgeon: false,
          narniaName: 'Dr. Roberto',
          phone: '(11) 98888-3333'
        });
        await ShiftModel.findByIdAndUpdate(tardeShift._id, { viceDirectorId: vice._id.toString() });
        console.log('  ✓ Vice-Diretor Tarde criado (Código: VICE002)');
      } else {
        console.log('  ⏭️  Vice-Diretor Tarde já existe');
      }
    }

    if (noiteShift) {
      const viceNoite = await UserModel.findOne({ accessCode: 'VICE003' });
      if (!viceNoite) {
        const vice = await UserModel.create({
          name: 'Dra. Paula Costa',
          accessCode: 'VICE003',
          role: 'vice_diretor',
          shiftId: noiteShift._id.toString(),
          isChiefSurgeon: false,
          narniaName: 'Dra. Paula',
          phone: '(11) 98888-4444'
        });
        await ShiftModel.findByIdAndUpdate(noiteShift._id, { viceDirectorId: vice._id.toString() });
        console.log('  ✓ Vice-Diretor Noite criado (Código: VICE003)');
      } else {
        console.log('  ⏭️  Vice-Diretor Noite já existe');
      }
    }

    // 5. Criar alguns membros de exemplo
    console.log('\n👥 Criando membros de exemplo...');
    
    if (manhaShift) {
      const cirurgiao = await UserModel.findOne({ accessCode: 'CIR001' });
      if (!cirurgiao) {
        await UserModel.create({
          name: 'Dr. João Oliveira',
          accessCode: 'CIR001',
          role: 'cirurgiao',
          shiftId: manhaShift._id.toString(),
          isChiefSurgeon: true,
          narniaName: 'Dr. João',
          phone: '(11) 98888-5555'
        });
        console.log('  ✓ Cirurgião Chefe criado (Código: CIR001)');
      } else {
        console.log('  ⏭️  Cirurgião Chefe já existe');
      }

      const terapeuta = await UserModel.findOne({ accessCode: 'TER001' });
      if (!terapeuta) {
        await UserModel.create({
          name: 'Dra. Maria Souza',
          accessCode: 'TER001',
          role: 'terapeuta',
          shiftId: manhaShift._id.toString(),
          isChiefSurgeon: false,
          narniaName: 'Dra. Maria',
          phone: '(11) 98888-6666'
        });
        console.log('  ✓ Terapeuta criado (Código: TER001)');
      } else {
        console.log('  ⏭️  Terapeuta já existe');
      }

      const paramedico = await UserModel.findOne({ accessCode: 'PAR001' });
      if (!paramedico) {
        await UserModel.create({
          name: 'Pedro Santos',
          accessCode: 'PAR001',
          role: 'paramedico',
          shiftId: manhaShift._id.toString(),
          isChiefSurgeon: false,
          narniaName: 'Pedro',
          phone: '(11) 98888-7777'
        });
        console.log('  ✓ Paramédico criado (Código: PAR001)');
      } else {
        console.log('  ⏭️  Paramédico já existe');
      }

      const estagiario = await UserModel.findOne({ accessCode: 'EST001' });
      if (!estagiario) {
        await UserModel.create({
          name: 'Lucas Silva',
          accessCode: 'EST001',
          role: 'estagiario',
          shiftId: manhaShift._id.toString(),
          isChiefSurgeon: false,
          narniaName: 'Lucas',
          phone: '(11) 98888-8888'
        });
        console.log('  ✓ Estagiário criado (Código: EST001)');
      } else {
        console.log('  ⏭️  Estagiário já existe');
      }
    }

    // 6. Importar convênio da pasta data
    console.log('\n🤝 Importando convênio...');
    const covenant = await CovenantModel.findOne({ organizationName: 'Família O SINDICATO' });
    if (!covenant) {
      await CovenantModel.create({
        organizationName: 'Família O SINDICATO',
        amountPaid: 4000,
        startDate: '2025-10-07T20:39:57.986Z',
        endDate: '2025-11-04T20:39:57.986Z',
        totalSeconds: 2419200,
        createdAt: '2025-10-07T20:39:57.986Z'
      });
      console.log('  ✓ Convênio importado');
    } else {
      console.log('  ⏭️  Convênio já existe');
    }

    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('✨ Banco de dados configurado com sucesso!\n');
    
    const allUsers = await UserModel.find().select('name accessCode role');
    console.log('📊 Usuários criados:\n');
    for (const user of allUsers) {
      const roleNames: Record<string, string> = {
        'administrador': 'Administrador',
        'diretor': 'Diretor',
        'vice_diretor': 'Vice-Diretor',
        'cirurgiao': 'Cirurgião',
        'terapeuta': 'Terapeuta',
        'paramedico': 'Paramédico',
        'estagiario': 'Estagiário'
      };
      console.log(`  👤 ${user.name}`);
      console.log(`     Cargo: ${roleNames[user.role] || user.role}`);
      console.log(`     Código: ${user.accessCode}\n`);
    }

    const allShifts = await ShiftModel.find();
    console.log('📅 Turnos criados:\n');
    for (const shift of allShifts) {
      console.log(`  ⏰ ${shift.name}`);
      console.log(`     Senha: ${shift.password}\n`);
    }

    console.log('🎉 Agora você pode fazer login com qualquer código de acesso!');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

setupDatabase();
