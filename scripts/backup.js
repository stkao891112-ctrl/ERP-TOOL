import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 注意：在 GitHub Actions 執行時，這些變數會從 Secrets 讀取
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少 Supabase 環境變數');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TABLES = [
  '商品分類表',
  '庫存總表',
  '銷貨表',
  '進貨表',
  '其他收支表'
];

async function backupTable(tableName, backupDir) {
  console.log(`[${tableName}] 開始讀取...`);
  const { data, error } = await supabase.from(tableName).select('*');
  
  if (error) {
    console.error(`[${tableName}] 讀取失敗:`, error.message);
    throw new Error(`${tableName} 讀取失敗: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.log(`[${tableName}] 注意：目前資料表是空的，略過產生 CSV。`);
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = data.map(row => 
    headers.map(header => {
      const val = row[header] === null ? '' : row[header];
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',')
  );

  const csvContent = [headers.join(','), ...csvRows].join('\n');
  const contentWithBOM = '\ufeff' + csvContent;

  fs.writeFileSync(path.join(backupDir, `${tableName}.csv`), contentWithBOM);
  console.log(`[${tableName}] 成功匯出 ${data.length} 筆資料！`);
}

async function runBackup() {
  console.log('--- 備份除錯日誌 ---');
  const now = new Date();
  console.log('時間 (UTC):', now.toISOString());
  console.log('URL 設定狀態:', !!supabaseUrl);
  console.log('Key 設定狀態:', !!supabaseKey);

  const backupsRoot = path.join(process.cwd(), 'backups');
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
  const dirPath = path.join(backupsRoot, `${dateStr}_${timeStr}`);
  
  try {
    if (!fs.existsSync(backupsRoot)) {
      fs.mkdirSync(backupsRoot, { recursive: true });
      fs.writeFileSync(path.join(backupsRoot, '.gitkeep'), '');
    }
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(path.join(dirPath, '.metadata'), `Backup initiated at ${now.toISOString()}`);
    }

    for (const table of TABLES) {
      await backupTable(table, dirPath);
    }
    console.log('--- 備份作業功德圓滿 ---');
  } catch (err) {
    console.error('--- 備份作業發生致命錯誤 ---');
    console.error(err.message);
    process.exit(1); // 強制讓 GitHub Actions 標示為失敗
  }
}

runBackup();
