# ContractorPro - פלטפורמת SaaS לקבלנים

<div dir="rtl">

פלטפורמה מקיפה לניהול פרויקטים, חישוב עלויות ותכנון תלת-מימדי עבור קבלנים ובעלי מקצוע בתחום הבנייה.

## תכונות עיקריות

### 🧮 מחשבון חכם
- 21 קטגוריות עבודה מקיפות
- מאות תתי-קטגוריות עם פרמטרים ייחודיים
- חישוב אוטומטי של פחת ורזרבה
- ניהול מחירון חומרים אישי

### 🏗️ עורך תלת-מימד
- ציור קירות אינטראקטיבי
- ספריית אובייקטים (דלתות, חלונות, ריהוט)
- מערכת חומרים וטקסטורות
- תצוגות 2D, 3D וסיור וירטואלי
- אינטגרציה ישירה עם המחשבון

### 📊 ניהול פרויקטים
- תצוגת Kanban
- מעקב התקדמות
- ניהול לקוחות
- היסטוריית פרויקטים

### 📄 הצעות מחיר
- יצירת הצעות מחיר מקצועיות
- ייצוא ל-PDF
- ניהול גרסאות
- מעקב סטטוס

### 👥 ניהול משתמשים
- Multi-tenant architecture
- הרשאות לפי תפקיד
- התחברות עם Google OAuth
- ניהול צוותים

## טכנולוגיות

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **3D Engine**: Three.js + React Three Fiber
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **PDF**: jsPDF

## התקנה

### דרישות מקדימות
- Node.js 18+
- PostgreSQL
- npm או yarn

### שלבים

1. שכפל את הפרויקט:
```bash
git clone <repository-url>
cd kablan
```

2. התקן תלויות:
```bash
npm install
```

3. צור קובץ `.env` והגדר את המשתנים:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/contractor_pro"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

4. צור את מסד הנתונים:
```bash
npm run db:push
```

5. הפעל את השרת:
```bash
npm run dev
```

6. פתח את הדפדפן בכתובת: http://localhost:3000

## מבנה הפרויקט

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # דפי התחברות והרשמה
│   ├── (dashboard)/        # דשבורד ראשי
│   ├── calculator/         # מחשבון חכם
│   ├── builder-3d/         # עורך תלת מימד
│   ├── projects/           # ניהול פרויקטים
│   ├── materials/          # ניהול חומרים
│   └── api/                # API Routes
├── components/
│   ├── ui/                 # shadcn components
│   ├── calculator/         # רכיבי מחשבון
│   ├── 3d-builder/         # רכיבי עורך 3D
│   └── shared/             # רכיבים משותפים
├── lib/
│   ├── calculator/         # לוגיקת חישוב
│   ├── 3d/                 # פונקציות Three.js
│   └── auth/               # הגדרות אימות
├── stores/                 # Zustand stores
├── data/                   # נתוני קטגוריות ותתי-קטגוריות
└── types/                  # TypeScript types
```

## סקריפטים

```bash
npm run dev          # הפעלת שרת פיתוח
npm run build        # בניית גרסת ייצור
npm run start        # הפעלת שרת ייצור
npm run lint         # בדיקת ESLint
npm run db:generate  # יצירת Prisma Client
npm run db:push      # עדכון מסד הנתונים
npm run db:migrate   # הרצת מיגרציות
npm run db:studio    # פתיחת Prisma Studio
```

## קטגוריות עבודה נתמכות

1. עבודות עפר וחפירה
2. בטון ויציקות
3. בנייה ומבנה
4. איטום ובידוד
5. טיח ושליכט
6. גבס וקונסטרוקציות יבשות
7. ריצוף וחיפוי
8. צבע וגימורים
9. נגרות ועץ
10. אלומיניום וחלונות
11. נירוסטה ומתכת
12. גגות
13. אינסטלציה - מים וביוב
14. חשמל ותאורה
15. מיזוג ואוורור
16. בטיחות ואבטחה
17. בריכות שחייה וספא
18. פיתוח שטח וגינון
19. מעליות והרמה
20. עבודות מיוחדות
21. הריסה ופירוק

## רישיון

MIT

## תמיכה

לשאלות ותמיכה, צרו קשר: support@contractorpro.co.il

</div>
