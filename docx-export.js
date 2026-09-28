/* =========================================================
   تصدير التقرير إلى Word (.docx)
   يستقبل نموذج بيانات جاهز من واجهة التطبيق (model) ويرجّع Buffer لملف docx.
   ========================================================= */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Footer,
  AlignmentType, BorderStyle, WidthType, ShadingType, PageNumber, LevelFormat,
  TableLayoutType, VerticalAlign,
} = require('docx');

const BROWN = '7A5C3E';
const BROWN_DARK = '5B4530';
const INK = '26221C';
const GRAY = '6B6155';

const BASE_FONT = { ascii: 'Calibri', hAnsi: 'Calibri', cs: 'Segoe UI' };
const HAS_ARABIC = /[\u0590-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const FAB_STYLE = {
  submitted: { fill: 'E4EFE8', color: '2E6B4F' },
  pending: { fill: 'F5EBDA', color: 'B4802E' },
  none: { fill: 'F5E2DF', color: 'A63A31' },
  custom: { fill: 'EFE6D8', color: BROWN_DARK },
};

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const CELL_NO_BORDERS = { top: NO_BORDER, left: NO_BORDER, right: NO_BORDER, bottom: NO_BORDER };

function fontFor(name) {
  if (!name) return BASE_FONT;
  // Calibri ما فيه حروف عربية: نخلي العربي بخط Segoe UI ونبقي اللاتيني Calibri
  if (/^calibri$/i.test(name)) return BASE_FONT;
  return { ascii: name, hAnsi: name, cs: name };
}

function hex6(c) {
  return /^[0-9a-f]{6}$/i.test(c || '') ? c.toUpperCase() : undefined;
}

/* ---------- سطور ملوّنة (runs) ---------- */
function makeRuns(runs, defaults) {
  defaults = defaults || {};
  const out = [];
  (runs || []).forEach((r) => {
    if (r.text === undefined || r.text === '') return;
    const bold = r.bold !== undefined ? r.bold : defaults.bold;
    const color = hex6(r.color) || hex6(defaults.color) || INK;
    const size = Math.round((r.sizePt || defaults.sizePt || 10.5) * 2);
    const opts = {
      text: r.text,
      bold: !!bold,
      italics: !!(r.italic || defaults.italic),
      strike: !!r.strike,
      color,
      size,
      font: fontFor(r.font),
      rightToLeft: HAS_ARABIC.test(r.text),
    };
    if (r.underline) opts.underline = {};
    const hl = hex6(r.highlight);
    if (hl) opts.shading = { type: ShadingType.CLEAR, fill: hl, color: 'auto' };
    out.push(new TextRun(opts));
  });
  return out;
}

function alignOf(a) {
  // الفقرة RTL: start = يمين
  // الفقرات RTL: بداية السطر (start) = يمين، ونهايته (end) = يسار
  if (a === 'center') return AlignmentType.CENTER;
  if (a === 'left') return AlignmentType.END;
  if (a === 'justify') return AlignmentType.BOTH;
  return undefined; // right = الافتراضي
}

let olCounter = 0;

/* سطور نقطة واحدة → فقرات Word */
function pointParagraphs(pt, baseColor, bold) {
  const paras = [];
  const lines = (pt.lines && pt.lines.length) ? pt.lines : [{ runs: [{ text: pt.text || '' }] }];
  let firstDone = false;
  let olInstance = null;
  let lastList = null;
  lines.forEach((ln) => {
    const runs = makeRuns(ln.runs, { color: baseColor, bold, sizePt: 10.5 });
    let numbering;
    let indent;
    if (!firstDone) {
      numbering = { reference: 'pt-bullet', level: 0 };
      firstDone = true;
      lastList = null;
    } else if (ln.list === 'ul') {
      numbering = { reference: 'sub-bullet', level: Math.min(ln.level || 0, 2) };
      lastList = 'ul';
    } else if (ln.list === 'ol') {
      if (lastList !== 'ol') { olCounter += 1; olInstance = olCounter; }
      numbering = { reference: 'sub-number', level: Math.min(ln.level || 0, 2), instance: olInstance };
      lastList = 'ol';
    } else {
      // سطر إضافي داخل نفس النقطة بدون رمز
      indent = { start: 340 };
      lastList = null;
    }
    paras.push(new Paragraph({
      bidirectional: true,
      alignment: alignOf(ln.align),
      numbering,
      indent,
      spacing: { after: 50, line: 300 },
      children: runs.length ? runs : [new TextRun({ text: '', size: 21 })],
    }));
  });
  return paras;
}

function emptyNoteParagraph(text) {
  return new Paragraph({
    bidirectional: true,
    spacing: { after: 40 },
    children: makeRuns([{ text: text || 'لم يتم ذكر أي نقاط لهذا المشروع ضمن هذه الفترة.' }],
      { color: '9A9388', italic: true, sizePt: 9.5 }),
  });
}

/* ---------- خلية الجانب: اسم المشروع + الموقع + FAB ---------- */
function sideCellChildren(p) {
  const kids = [];
  kids.push(new Paragraph({
    bidirectional: true, keepNext: true, spacing: { after: 40 },
    children: makeRuns([{ text: p.name }], { bold: true, color: '3A2F22', sizePt: 11.5 }),
  }));
  if (p.location) {
    kids.push(new Paragraph({
      bidirectional: true, spacing: { after: 20 },
      children: makeRuns([{ text: p.location }], { color: GRAY, sizePt: 8.5 }),
    }));
  }
  (p.lics || []).forEach((t) => {
    kids.push(new Paragraph({
      bidirectional: true, spacing: { after: 20 },
      children: makeRuns([{ text: t }], { color: GRAY, sizePt: 8.5 }),
    }));
  });
  if (p.fab && p.fab.text) {
    const st = FAB_STYLE[p.fab.cls] || FAB_STYLE.none;
    kids.push(new Paragraph({
      bidirectional: true, spacing: { before: 60, after: 20 },
      children: [new TextRun({
        text: ` ${p.fab.text} `, bold: true, size: 17, color: st.color,
        font: BASE_FONT, rightToLeft: HAS_ARABIC.test(p.fab.text),
        shading: { type: ShadingType.CLEAR, fill: st.fill, color: 'auto' },
      })],
    }));
  }
  return kids;
}

function projectRow(p, sideW, notesW) {
  const noteParas = [];
  if (p.points && p.points.length) {
    p.points.forEach((pt) => {
      const bold = pt.cls === 'g' || pt.cls === 'r';
      const color = pt.cls === 'g' ? '2E6B4F' : pt.cls === 'r' ? 'A63A31' : INK;
      pointParagraphs(pt, color, bold).forEach((x) => noteParas.push(x));
    });
  } else {
    noteParas.push(emptyNoteParagraph(p.emptyNote));
  }
  const bottom = { style: BorderStyle.DOTTED, size: 4, color: 'B9A98F' };
  const borders = { top: NO_BORDER, left: NO_BORDER, right: NO_BORDER, bottom };
  const margins = { top: 90, bottom: 90, left: 80, right: 80 };
  return new TableRow({
    cantSplit: true,
    children: [
      new TableCell({
        width: { size: sideW, type: WidthType.DXA }, borders, margins,
        verticalAlign: VerticalAlign.TOP, children: sideCellChildren(p),
      }),
      new TableCell({
        width: { size: notesW, type: WidthType.DXA }, borders, margins,
        verticalAlign: VerticalAlign.TOP, children: noteParas,
      }),
    ],
  });
}

function categoryTitle(text) {
  return new Paragraph({
    bidirectional: true, keepNext: true,
    spacing: { before: 280, after: 100 },
    shading: { type: ShadingType.CLEAR, fill: BROWN, color: 'auto' },
    indent: { start: 60, end: 60 },
    children: makeRuns([{ text: ` ${text}` }], { bold: true, color: 'FFFFFF', sizePt: 11.5 }),
  });
}

/* ---------- بناء المستند ---------- */
async function buildDocx(model) {
  const PAGE_W = 11906;
  const MARGIN = 794; // 14mm
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const SIDE_W = 3000;
  const NOTES_W = CONTENT_W - SIDE_W;

  const children = [];

  // الترويسة
  children.push(new Paragraph({
    bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: makeRuns([{ text: model.title || 'التقرير الأسبوعي لحالة المشاريع' }],
      { bold: true, color: BROWN_DARK, sizePt: 18 }),
  }));
  const chipRuns = [];
  (model.chips || []).forEach((c, i) => {
    if (i > 0) chipRuns.push({ text: '      |      ', color: 'B9A98F' });
    chipRuns.push({ text: `${c.label}: `, bold: true, color: BROWN });
    chipRuns.push({ text: c.value, color: '4A3B2A' });
  });
  children.push(new Paragraph({
    bidirectional: true, alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    border: { bottom: { style: BorderStyle.DOUBLE, size: 12, color: BROWN, space: 8 } },
    children: makeRuns(chipRuns, { sizePt: 10 }),
  }));

  // الأقسام
  (model.sections || []).forEach((s) => {
    if (s.type === 'category') {
      children.push(categoryTitle(s.title));
      const rows = (s.projects || []).map((p) => projectRow(p, SIDE_W, NOTES_W));
      if (rows.length) {
        children.push(new Table({
          visuallyRightToLeft: true,
          layout: TableLayoutType.FIXED,
          width: { size: CONTENT_W, type: WidthType.DXA },
          columnWidths: [SIDE_W, NOTES_W],
          borders: {
            top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER,
            insideHorizontal: NO_BORDER, insideVertical: NO_BORDER,
          },
          rows,
        }));
      }
    } else if (s.type === 'extras') {
      children.push(categoryTitle(s.title || 'بنود إضافية'));
      (s.items || []).forEach((x) => {
        if (x.title) {
          children.push(new Paragraph({
            bidirectional: true, keepNext: true, spacing: { before: 100, after: 40 },
            children: makeRuns([{ text: x.title }], { bold: true, color: '3A2F22', sizePt: 11 }),
          }));
        }
        String(x.text || '').split(/\r?\n/).forEach((line, i, arr) => {
          children.push(new Paragraph({
            bidirectional: true,
            spacing: { after: i === arr.length - 1 ? 120 : 30, line: 320 },
            border: i === arr.length - 1
              ? { bottom: { style: BorderStyle.DOTTED, size: 4, color: 'B9A98F', space: 6 } } : undefined,
            children: makeRuns([{ text: line }], { sizePt: 10.5 }),
          }));
        });
      });
    } else if (s.type === 'note') {
      children.push(new Paragraph({
        bidirectional: true, spacing: { before: 200 },
        children: makeRuns([{ text: s.text }], { color: '9A9388', italic: true }),
      }));
    }
  });

  const footer = new Footer({
    children: [new Paragraph({
      bidirectional: true, alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'صفحة ', size: 17, color: '9A9388', font: BASE_FONT, rightToLeft: true }),
        new TextRun({ children: [PageNumber.CURRENT], size: 17, color: '9A9388', font: BASE_FONT, rightToLeft: true }),
        new TextRun({ text: ' من ', size: 17, color: '9A9388', font: BASE_FONT, rightToLeft: true }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 17, color: '9A9388', font: BASE_FONT, rightToLeft: true }),
      ],
    })],
  });

  const bullet = (text, color, start, hanging) => ({
    level: 0, format: LevelFormat.BULLET, text,
    style: { run: { color, font: { ascii: 'Arial', hAnsi: 'Arial', cs: 'Arial' } }, paragraph: { indent: { start, hanging } } },
  });
  const subLevels = [0, 1, 2].map((lv) => ({
    level: lv, format: LevelFormat.BULLET, text: lv === 0 ? '•' : '–',
    style: { run: { color: BROWN }, paragraph: { indent: { start: 700 + lv * 340, hanging: 240 } } },
  }));
  const numLevels = [0, 1, 2].map((lv) => ({
    level: lv, format: LevelFormat.DECIMAL, text: `%${lv + 1}.`,
    style: { run: { color: BROWN }, paragraph: { indent: { start: 700 + lv * 340, hanging: 300 } } },
  }));

  const doc = new Document({
    creator: 'متابعة المشاريع',
    title: model.title || 'التقرير الأسبوعي لحالة المشاريع',
    styles: {
      default: {
        document: {
          run: { font: BASE_FONT, size: 21, color: INK },
          paragraph: { spacing: { line: 300 } },
        },
      },
    },
    numbering: {
      config: [
        { reference: 'pt-bullet', levels: [bullet('◆', BROWN, 300, 260)] },
        { reference: 'sub-bullet', levels: subLevels },
        { reference: 'sub-number', levels: numLevels },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_W, height: 16838 },
          margin: { top: MARGIN, bottom: 900, left: MARGIN, right: MARGIN, footer: 400 },
        },
      },
      footers: { default: footer },
      children,
    }],
  });

  return Packer.toBuffer(doc);
}

module.exports = { buildDocx };
