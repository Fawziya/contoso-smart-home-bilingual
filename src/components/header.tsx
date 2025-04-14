'use client';

import { useState, useEffect } from "react";
import clsx from "clsx";
import Image from "next/image";
import Block from "@/components/block";
import { HomeIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { getImageWithTimestamp } from "@/lib/imageUtils";
import LanguageSwitcher from "./language-switcher";
import { useTranslation } from "@/lib/language-context";

export const Header = ({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const { t, locale } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  
  // 使用 useEffect 来防止水合不匹配
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const user = {
    name: "Jen Yu",
    email: "smart.home@contoso.com",
    image: "/people/jenyu.jpg",
  };

  return (
    <Block
      outerClassName="bg-white shadow-sm sticky top-0 z-50"
      innerClassName="h-16 flex flex-row center items-center"
    >
      <div className="flex items-center">
        <a href={isClient ? `/${locale}${searchParams?.type ? "?type=" + searchParams.type : ""}` : "#"} className="flex items-center">
          <div className="flex">
            <HomeIcon className="mr-1 h-6 w-6 text-primary-dark" />
            <div className="mr-2 text-2xl font-bold text-secondary-light">Contoso</div>
          </div>
        </a>
      </div>
      <div className="grow pl-8">
        <nav className="flex gap-6">
          <a href={isClient ? `/${locale}` : "#"} className="text-secondary hover:text-secondary-light transition-colors flex items-center gap-1">
            <HomeIcon className="w-4 h-4" />
            <span>{isClient ? t('header.home') : 'Home'}</span>
          </a>
          <a href={isClient ? `/${locale}#smart-hubs` : "#"} className="text-secondary hover:text-secondary-light transition-colors">
            {isClient ? t('header.smartHubs') : 'Smart Hubs'}
          </a>
          <a href={isClient ? `/${locale}#security` : "#"} className="text-secondary hover:text-secondary-light transition-colors">
            {isClient ? t('header.security') : 'Security'}
          </a>
          <a href={isClient ? `/${locale}#lighting` : "#"} className="text-secondary hover:text-secondary-light transition-colors">
            {isClient ? t('header.lighting') : 'Lighting'}
          </a>
          <a href={isClient ? `/${locale}#sensors` : "#"} className="text-secondary hover:text-secondary-light transition-colors">
            {isClient ? t('header.sensors') : 'Sensors'}
          </a>
        </nav>
      </div>
      <div className="flex flex-row items-center gap-6">
        {/* 仅在客户端渲染时显示语言切换器 */}
        {isClient && <LanguageSwitcher />}
        
        <div className="relative">
          <ShoppingCartIcon className="w-6 h-6 text-secondary hover:text-secondary-light transition-colors cursor-pointer" />
          <div className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            0
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <div className="text-right font-medium text-secondary-light">
              {user.name}
            </div>
            <div className="text-right text-xs text-secondary">{user.email}</div>
          </div>
          {isClient && (
            <div className="">
              <Image
                src={getImageWithTimestamp(user.image)}
                width={40}
                height={40}
                alt={user.name}
                className="rounded-full"
                priority
              />
            </div>
          )}
        </div>
      </div>
    </Block>
  );
};

export default Header;
