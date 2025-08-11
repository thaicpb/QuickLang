import Link from "next/link";

const quickLinks = [
  { href: "/flashcards", label: "Quản lý thẻ học", color: "bg-blue-600 hover:bg-blue-700" },
  { href: "/folders", label: "Bộ sưu tập", color: "bg-green-600 hover:bg-green-700" },
  { href: "/quiz", label: "Luyện tập nhanh", color: "bg-purple-600 hover:bg-purple-700" },
];

const highlights = [
  "Học nhanh với hiệu ứng lật thẻ trực quan.",
  "Theo dõi độ khó và số lần ôn tập của từng thẻ.",
  "Tổ chức nội dung theo thư mục và chủ đề.",
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Bảng điều khiển</h1>
          <span className="text-sm text-gray-500">Không cần đăng nhập — bắt đầu học ngay</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng đến QuickLang</h2>
              <p className="text-gray-600">
                Truy cập toàn bộ tính năng mà không cần tài khoản. Chọn một thao tác để bắt đầu.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {quickLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex justify-center items-center px-4 py-3 text-white rounded-md text-sm font-medium transition-colors ${item.color}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Điểm nổi bật</h3>
              <ul className="space-y-3">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Mẹo học nhanh</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p>• Học từng nhóm nhỏ 5–10 thẻ để dễ ghi nhớ.</p>
              <p>• Sử dụng mục Luyện tập nhanh để kiểm tra độ nhớ.</p>
              <p>• Đánh dấu độ khó để xem lại các thẻ cần ưu tiên.</p>
            </div>
            <Link
              href="/flashcards/new"
              className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
            >
              Tạo thẻ mới
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
