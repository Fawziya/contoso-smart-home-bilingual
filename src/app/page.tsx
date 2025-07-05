'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/language-context';
import Header from '@/components/header';
import Block from '@/components/block';
import Image from 'next/image';
import { getImageWithTimestamp } from '@/lib/imageUtils';
import clsx from 'clsx';

export default function Home({
  params,
  searchParams,
}: {
  params?: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { t, locale } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [categories, setCategories] = useState([]);
  const [resolvedParams, setResolvedParams] = useState<{ lang: string } | null>(null);
  const [resolvedSearchParams, setResolvedSearchParams] = useState<{ [key: string]: string | string[] | undefined }>({});
  
  // 解析Promise类型的params和searchParams
  useEffect(() => {
    Promise.all([
      params || Promise.resolve(null),
      searchParams
    ]).then(([p, sp]) => {
      setResolvedParams(p);
      setResolvedSearchParams(sp);
    });
  }, [params, searchParams]);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // 在客户端获取数据
    const fetchData = async () => {
      try {
        const categoriesRes = await fetch('/categories.json');
        const productsRes = await fetch('/products.json');
        
        const categoriesData = await categoriesRes.json();
        const productsData = await productsRes.json();
        
        // 为每个类别关联对应的产品
        categoriesData.forEach((category: any) => {
          category.products = productsData.filter((product: any) => 
            product.category === category.name
          );
        });
        
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, []);

  // 仪表盘状态数据
  const dashboardData = {
    homeStatus: {
      title: locale === 'zh' ? '家庭状态' : 'Home Status',
      value: locale === 'zh' ? '安全' : 'Secure',
      icon: '🏠'
    },
    temperature: {
      title: locale === 'zh' ? '温度' : 'Temperature',
      value: '72°F',
      icon: '🌡️'
    },
    lighting: {
      title: locale === 'zh' ? '照明' : 'Lighting',
      value: locale === 'zh' ? '4个活动' : '4 Active',
      icon: '💡'
    },
    energy: {
      title: locale === 'zh' ? '能源' : 'Energy',
      value: locale === 'zh' ? '最佳' : 'Optimal',
      icon: '⚡'
    }
  };

  return (
    <>
      <Header params={{slug: ''}} searchParams={resolvedSearchParams} />
      <Block
        outerClassName="bg-primary border-b border-gray-100"
        innerClassName=""
      >
        <div className="text-secondary-light pt-12 text-6xl font-bold subpixel-antialiased">
          {t('home.title')}
        </div>
        <div className="text-secondary mt-4 text-2xl">
          {t('home.subtitle')}
        </div>
        <div className="text-secondary mt-2 text-lg w-2/3 pb-12">
          {locale === 'zh' ? 
            "探索我们创新的智能家居产品系列，旨在让您的生活更加舒适、安全和高效。从智能集线器到直观传感器，我们拥有一切您需要的产品，以创造完美的互联家居体验。" : 
            "Discover our innovative range of smart home products designed to make your life more comfortable, secure, and efficient. From intelligent hubs to intuitive sensors, we have everything you need to create the perfect connected home experience."
          }
        </div>
      </Block>

      {/* Smart Home Dashboard */}
      <Block
        innerClassName="p-8"
        outerClassName="bg-primary-light"
      >
        <div className="text-3xl mb-6 font-medium text-secondary-light">
          {locale === 'zh' ? "您的家，比以往更智能" : "Your Home, Smarter Than Ever"}
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          <div className="md:w-1/2 flex flex-col">
            <p className="text-lg mb-6 text-secondary">
              {locale === 'zh' ? 
                "Contoso通过我们无缝集成的智能设备生态系统，为日常生活带来智能体验。通过简单的语音命令或我们直观的移动应用程序控制您的整个家居。" : 
                "Contoso brings intelligence to everyday living with our seamlessly integrated ecosystem of smart devices. Control your entire home with simple voice commands or our intuitive mobile app."
              }
            </p>
            
            <div className="grid grid-cols-2 gap-6 flex-grow">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-xl font-medium text-secondary-light mb-2">
                  {locale === 'zh' ? "节能环保" : "Energy Efficient"}
                </div>
                <div className="text-secondary">
                  {locale === 'zh' ? 
                    "通过我们的智能家居解决方案，节省高达23%的公用事业账单" : 
                    "Save up to 23% on utility bills with our smart home solutions"
                  }
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-xl font-medium text-secondary-light mb-2">
                  {locale === 'zh' ? "简易安装" : "Easy Setup"}
                </div>
                <div className="text-secondary">
                  {locale === 'zh' ? 
                    "通过我们即插即用的设备，几分钟内即可开始使用" : 
                    "Get started in minutes with our plug-and-play devices"
                  }
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-xl font-medium text-secondary-light mb-2">
                  {locale === 'zh' ? "兼容性强" : "Compatible"}
                </div>
                <div className="text-secondary">
                  {locale === 'zh' ? 
                    "可与100多种第三方设备和服务兼容" : 
                    "Works with over 100 third-party devices and services"
                  }
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-xl font-medium text-secondary-light mb-2">
                  {locale === 'zh' ? "安全可靠" : "Secure"}
                </div>
                <div className="text-secondary">
                  {locale === 'zh' ? 
                    "端到端加密确保您的数据和家庭安全" : 
                    "End-to-end encryption keeps your data and home safe"
                  }
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 flex flex-col">
            <div className="bg-white p-6 rounded-xl shadow-sm flex-grow">
              <div className="text-xl font-medium text-secondary-light mb-2">
                {locale === 'zh' ? "智能家居仪表盘" : "Smart Home Dashboard"}
              </div>
              <div className="text-secondary mb-4">
                {locale === 'zh' ? "实时监控您的家居状态" : "Monitor your home status in real-time"}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(dashboardData).map(([key, data]) => (
                  <div key={key} className="bg-gray-50 p-6 rounded-xl flex flex-col items-center text-center">
                    <span className="text-3xl mb-4">{data.icon}</span>
                    <div className="text-secondary text-lg">
                      {data.title}
                    </div>
                    <div className="text-secondary-light text-2xl font-medium mt-1">
                      {data.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Block>

      {/* Categories */}
      {categories.map((category: any, i) => (
        <Block
          key={i}
          innerClassName="p-8"
          outerClassName={clsx(i % 2 == 1 ? "bg-primary-light" : "bg-primary")}
        >
          <div className="text-3xl mb-3 font-medium text-secondary-light">
            {category.nameZh && locale === 'zh' ? category.nameZh : category.name}
          </div>
          <div className="text-secondary text-xl mb-6">
            {category.descriptionZh && locale === 'zh' ? category.descriptionZh : category.description}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            {category.products && category.products.length > 0 ? (
              category.products.map((product: any, j: number) => (
                <div key={j} className="group">
                  <div className="flex flex-col">
                    <div className="bg-white p-4 rounded-xl shadow-sm group-hover:shadow transition-shadow relative">
                      {/* Product image with white background */}
                      <div className="bg-white flex justify-center items-center p-3 mb-3">
                        <Image
                          src={getImageWithTimestamp(product.images[0])}
                          alt={product.nameZh && locale === 'zh' ? product.nameZh : product.name}
                          width={220}
                          height={220}
                          className="object-contain w-full h-48"
                        />
                      </div>
                      
                      {/* Product name in bold, black */}
                      <div className="text-lg font-bold text-secondary-light">
                        {product.nameZh && locale === 'zh' ? product.nameZh : product.name}
                      </div>
                      
                      {/* Product price */}
                      <div className="text-accent font-medium mt-1 mb-3">
                        ${product.price.toFixed(2)}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 mt-2">
                        <a 
                          href="#"
                          className="bg-secondary-dark text-white px-3 py-2 rounded text-sm font-medium text-center flex-1 hover:bg-opacity-90 transition-colors"
                        >
                          {locale === 'zh' ? "立即购买" : "Buy now"}
                        </a>
                        <a 
                          href={`/${locale}/products/${product.slug}${resolvedSearchParams?.type ? "?type=" + resolvedSearchParams.type : ""}`}
                          className="border border-secondary-dark text-secondary-dark px-3 py-2 rounded text-sm font-medium text-center flex-1 hover:bg-hover transition-colors"
                        >
                          {locale === 'zh' ? "了解更多" : "Learn more"}
                        </a>
                      </div>
                      
                      {/* Special tags */}
                      {j % 5 === 0 && (
                        <div className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                          {locale === 'zh' ? "优惠11%" : "11% off"}
                        </div>
                      )}
                      {j % 7 === 0 && (
                        <div className="absolute top-2 left-2 bg-secondary text-white text-xs font-medium px-2 py-1 rounded">
                          {locale === 'zh' ? "缺货" : "Out of stock"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full text-center text-secondary py-8 col-span-4">
                {locale === 'zh' 
                  ? `即将推出！我们最新的${category.nameZh || category.name}产品将很快上市。`
                  : `Coming soon! Our newest ${category.name.toLowerCase()} products will be available shortly.`
                }
              </div>
            )}
          </div>
        </Block>
      ))}
    </>
  );
}
