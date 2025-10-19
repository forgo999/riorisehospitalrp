import { readFileSync } from 'fs';
import { connectToDatabase } from '../server/db/connection';
import { CovenantModel, RuleModel, MeCommandModel, AttendanceRecordModel } from '../server/db/models';

async function importData() {
  try {
    await connectToDatabase();
    console.log('📦 Starting data import...\n');

    const covenants = JSON.parse(readFileSync('./data/covenants.json', 'utf-8'));
    const rules = JSON.parse(readFileSync('./data/rules.json', 'utf-8'));
    const meCommands = JSON.parse(readFileSync('./data/me-commands.json', 'utf-8'));
    const attendance = JSON.parse(readFileSync('./data/attendance.json', 'utf-8'));

    if (covenants.length > 0) {
      console.log(`Importing ${covenants.length} covenant(s)...`);
      for (const covenant of covenants) {
        const { id, ...covenantData } = covenant;
        const existing = await CovenantModel.findOne({ organizationName: covenant.organizationName });
        if (!existing) {
          await CovenantModel.create(covenantData);
          console.log(`  ✓ Created covenant: ${covenant.organizationName}`);
        } else {
          console.log(`  ⏭️  Covenant already exists: ${covenant.organizationName}`);
        }
      }
      console.log('✅ Covenants imported successfully');
    } else {
      console.log('⏭️  No covenants to import');
    }

    if (rules.length > 0) {
      console.log(`Importing ${rules.length} rule(s)...`);
      for (const rule of rules) {
        const { id, ...ruleData } = rule;
        const existing = await RuleModel.findOne({ title: rule.title, type: rule.type });
        if (!existing) {
          await RuleModel.create(ruleData);
          console.log(`  ✓ Created rule: ${rule.title}`);
        } else {
          console.log(`  ⏭️  Rule already exists: ${rule.title}`);
        }
      }
      console.log('✅ Rules imported successfully');
    } else {
      console.log('⏭️  No rules to import');
    }

    if (meCommands.length > 0) {
      console.log(`Importing ${meCommands.length} ME command(s)...`);
      for (const command of meCommands) {
        const { id, ...commandData } = command;
        const existing = await MeCommandModel.findOne({ command: command.command });
        if (!existing) {
          await MeCommandModel.create(commandData);
          console.log(`  ✓ Created ME command: ${command.command}`);
        } else {
          console.log(`  ⏭️  ME command already exists: ${command.command}`);
        }
      }
      console.log('✅ ME commands imported successfully');
    } else {
      console.log('⏭️  No ME commands to import');
    }

    if (attendance.length > 0) {
      console.log(`Importing ${attendance.length} attendance record(s)...`);
      for (const record of attendance) {
        const { id, ...recordData } = record;
        await AttendanceRecordModel.create(recordData);
        console.log(`  ✓ Created attendance record`);
      }
      console.log('✅ Attendance records imported successfully');
    } else {
      console.log('⏭️  No attendance records to import');
    }

    console.log('\n✨ Data import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
}

importData();
