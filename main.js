const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'متابعة المشاريع',
    show: false,
    autoHideMenuBar: true, // يخفي شريط القوائم العلوي بصرياً، لكن يبقي اختصارات لوحة المفاتيح تعمل بالخلفية
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // قائمة "تحرير" أساسية (غير ظاهرة بسبب autoHideMenuBar) — وجودها ضروري على ويندوز
  // حتى تبقى اختصارات النسخ/اللصق/التراجع/التحديد وإدخال النص شغّالة بشكل سليم داخل الحقول
  const menu = Menu.buildFromTemplate([
    {
      label: 'تحرير',
      submenu: [
        { role: 'undo', label: 'تراجع' },
        { role: 'redo', label: 'إعادة' },
        { type: 'separator' },
        { role: 'cut', label: 'قص' },
        { role: 'copy', label: 'نسخ' },
        { role: 'paste', label: 'لصق' },
        { type: 'separator' },
        { role: 'selectAll', label: 'تحديد الكل' },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  win.loadFile(path.join(__dirname, 'app', 'index.html'));

  // نتأكد إن نافذة التطبيق تاخذ تركيز الكيبورد فعلياً عند الظهور
  // (يحل مشاكل عدم استجابة الكتابة عند فتح البرنامج على بعض أجهزة ويندوز)
  win.once('ready-to-show', () => {
    win.show();
    win.focus();
    win.webContents.focus();
  });

  // إلغاء التعليق بالسطر التالي إذا احتجت أدوات المطوّر أثناء التجربة:
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
