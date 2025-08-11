import Link from "next/link";

const actions = [
  { href: "/dashboard", label: "Bảng điều khiển", color: "bg-indigo-600 hover:bg-indigo-700" },
  { href: "/flashcards", label: "Quản lý thẻ học", color: "bg-blue-600 hover:bg-blue-700" },
  { href: "/folders", label: "Bộ sưu tập", color: "bg-green-600 hover:bg-green-700" },
  { href: "/quiz", label: "Luyện tập nhanh", color: "bg-purple-600 hover:bg-purple-700" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">QuickLang</h1>
          <p className="mt-2 text-gray-600">
            Học ngôn ngữ nhanh chóng với thẻ học, thư mục và bài kiểm tra. Không cần đăng nhập.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${action.color}`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
