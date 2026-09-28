const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { buildDocx } = require('./docx-export');

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'متابعة المشاريع',
    show: false,
    backgroundColor: '#F4F1EA',
    autoHideMenuBar: true, // يخفي شريط القوائم العلوي بصرياً، لكن يبقي اختصارات لوحة المفاتيح تعمل بالخلفية
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
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

  // إصلاح: أحياناً بعد ما تُفتح نافذة نظام مؤقتة (منتقي الألوان 🎨، منتقي التاريخ 📅،
  // نافذة الحفظ...) وتنغلق، ويندوز يرجّع تركيز النافذة نفسها لكن ما يرجّع تركيز الكيبورد
  // فعلياً لمحتوى الصفحة — فتحس إن الكتابة "متوقفة" رغم إن النافذة ظاهرة وفعّالة.
  // هذا يجبر إعادة تركيز الكيبورد على الصفحة كل مرة النافذة ترجع تاخذ التركيز.
  win.on('focus', () => {
    win.webContents.focus();
  });

  // إلغاء التعليق بالسطر التالي إذا احتجت أدوات المطوّر أثناء التجربة:
  // win.webContents.openDevTools();
}

// تصدير التقرير إلى Word: الواجهة ترسل نموذج البيانات، والعملية الرئيسية تبني الملف وتحفظه
ipcMain.handle('export-word', async (event, model, suggestedName) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender);
    const safeName = String(suggestedName || 'report.docx').replace(/[\\/:*?"<>|]/g, '-');
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'حفظ التقرير كملف Word',
      defaultPath: path.join(app.getPath('documents'), safeName),
      filters: [{ name: 'Word', extensions: ['docx'] }],
    });
    if (canceled || !filePath) return { ok: false, canceled: true };
    const buf = await buildDocx(model);
    fs.writeFileSync(filePath, buf);
    return { ok: true, filePath };
  } catch (err) {
    return { ok: false, error: String((err && err.message) || err) };
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
