import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
 
// 处理默认路径重定向到英文版本
function redirectToDefaultLocale(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (url.pathname === '/') {
    url.pathname = '/en';
    return NextResponse.redirect(url);
  }
  return null;
}

// 国际化路由中间件
const intlMiddleware = createMiddleware({
  // 支持的所有语言列表
  locales: ['en', 'zh'],
 
  // 默认语言
  defaultLocale: 'en'
});

// 组合中间件
export default function middleware(request: NextRequest) {
  const redirectResponse = redirectToDefaultLocale(request);
  if (redirectResponse) return redirectResponse;
  return intlMiddleware(request);
}
 
export const config = {
  // 跳过不需要国际化的路径
  matcher: ['/((?!api|_next|.*\\..*).*)']
};