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
  '其他收支表',
  '批次庫存表'
];

async function backupTable(tableName) {
  console.log(`正在備份: ${tableName}...`);
  const { data, error } = await supabase.from(tableName).select('*');
  
  if (error) {
    console.error(`${tableName} 備份失敗:`, error);
    return;
  }

  if (!data || data.length === 0) {
    console.log(`${tableName} 無資料，略過。`);
    return;
  }

  // 取得所有欄位名稱作為 Header
  const headers = Object.keys(data[0]);
  
  // 轉換為 CSV 格式
  const csvRows = data.map(row => 
    headers.map(header => {
      const val = row[header] === null ? '' : row[header];
      // 處理包含逗號或斷行的字串，用雙引號包起來
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',')
  );

  const csvContent = [headers.join(','), ...csvRows].join('\n');
  
  // 加上 UTF-8 BOM (\ufeff) 確保 Excel 開啟不亂碼
  const contentWithBOM = '\ufeff' + csvContent;

  const dateStr = new Date().toISOString().split('T')[0];
  const dirPath = path.join(process.cwd(), 'backups', dateStr);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(path.join(dirPath, `${tableName}.csv`), contentWithBOM);
  console.log(`${tableName} 備份完成！`);
}

async function runBackup() {
  console.log('--- 備份作業開始 ---');
  console.log('Supabase URL:', supabaseUrl ? '已設定' : '未設定');
  console.log('Supabase Key:', supabaseKey ? '已設定' : '未設定');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('錯誤：請在 GitHub Secrets 中設定 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  for (const table of TABLES) {
    await backupTable(table);
  }
  console.log('--- 備份作業結束 ---');
}

runBackup();
