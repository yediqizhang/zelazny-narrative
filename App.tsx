import React, { useState, useRef } from 'react';
import Snowfall from './components/Snowfall';

const App: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isCompleted, setIsCompleted] = useState(false);
  const [visibleArtifactCount, setVisibleArtifactCount] = useState(2);
  
  // 追踪第 5 页隐藏的短语索引
  const [hiddenPhrases, setHiddenPhrases] = useState<Set<number>>(new Set());
  
  const timerRef = useRef<number | null>(null);

  // 可调参数：进度条转动总时长（毫秒）
  const PROGRESS_DURATION = 5000; 

  const artifacts = [
    "十分原始的刀子",
    "雕刻的象牙",
    "几只破浴缸",
    "一批儿童故事实体书",
    "珠宝",
    "餐具",
    "完好的浴缸",
    "一部交响曲的片段章节",
    "十七颗纽扣",
    "三个皮带扣",
    "一座方尖碑的上半截",
    "半个马桶垫圈"
  ];

  // 第 5 页散落的文案定义 - 确保包含所有请求的 7 个句子
  const scatterPhrases = [
    { text: <>人创造了逻辑，<br />因此高于逻辑</>, pos: "absolute top-[18%] left-[12%] max-w-[280px] text-left" },
    { text: <>人可以制造工具，<br />但无法真正感知这些数值</>, pos: "absolute top-[22%] right-[10%] max-w-[320px] text-right" },
    { text: <>人感知的不是<br />英寸、米、磅和加仑</>, pos: "absolute bottom-[28%] left-[15%] max-w-[280px] text-left" },
    { text: <>人只感到热，感到冷，<br />感到轻重</>, pos: "absolute bottom-[20%] right-[12%] max-w-[280px] text-right" },
    { text: "人不能感知度量", pos: "absolute top-[40%] left-[5%] text-left w-full md:w-auto" },
    { text: <>人还懂得恨和爱、骄傲和绝望，<br />这些事物是无法度量的</>, pos: "absolute bottom-[38%] right-[8%] text-right w-full max-w-md" },
    { text: <>人的感受是无法以公式计算的，<br />情绪也没有换算因数</>, pos: "absolute top-[5%] right-[25%] max-w-[240px] text-center" }
  ];

  const handlePhraseClick = (index: number) => {
    setHiddenPhrases(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  // Handlers for the long press interaction on page 3
  const handlePressStart = () => {
    if (isCompleted) return;
    setIsHolding(true);
    
    const startTime = Date.now();

    const update = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / PROGRESS_DURATION) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        timerRef.current = requestAnimationFrame(update);
      } else {
        setIsCompleted(true);
        setIsHolding(false);
        if (timerRef.current) {
          cancelAnimationFrame(timerRef.current);
          timerRef.current = null;
        }
      }
    };
    timerRef.current = requestAnimationFrame(update);
  };

  const handlePressEnd = () => {
    if (isCompleted) return;
    setIsHolding(false);
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    // 中断处理：进度条清零
    setProgress(0);
  };

  const handleExploreNext = () => {
    if (visibleArtifactCount < artifacts.length) {
      setVisibleArtifactCount(prev => prev + 1);
    } else {
      setPage(5);
    }
  };

  // Helper component to render a high-density, realistic 3D sphere grid
  const SphereGrid = ({ revealProgress }: { revealProgress: number }) => {
    const latLines = [6, 12, 18, 24, 30, 36, 42, 48]; 
    const lonSteps = 24; 
    const lastLat = 48;

    const rTerminal = Math.sqrt(1 - Math.pow((lastLat - 50) / 50, 2)) * 50;
    const rxT = rTerminal;
    const ryT = rTerminal * 0.3;

    // 联动效果：从上到下逐渐显现 (0 -> lastLat)
    const currentRevealY = (revealProgress / 100) * lastLat;
    
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full scale-[1.05]">
        <defs>
          <mask id="sphere-mask">
            <rect x="0" y="0" width="100" height="100" fill="black" />
            <path 
              d={`
                M 0 0 
                H 100 
                V ${currentRevealY} 
                A ${rxT} ${ryT} 0 0 1 0 ${currentRevealY} 
                Z
              `} 
              fill="white" 
            />
          </mask>
        </defs>

        <g fill="none">
          <g stroke="rgba(255,255,255,0.6)" strokeWidth="0.2" mask="url(#sphere-mask)">
            {Array.from({ length: lonSteps }).map((_, i) => {
              const rx = (i / lonSteps) * 50;
              return (
                <React.Fragment key={`lon-${i}`}>
                  <path d={`M 50 0 A ${rx} 50 0 0 0 50 100`} />
                  <path d={`M 50 0 A ${rx} 50 0 0 1 50 100`} />
                </React.Fragment>
              );
            })}
            <line x1="50" y1="0" x2="50" y2="100" strokeWidth="0.3" opacity="0.8" />
          </g>

          <g stroke="rgba(255,255,255,0.7)" strokeWidth="0.2">
            {latLines.map((lat) => {
              if (lat > currentRevealY && !isCompleted && page !== 4) return null;
              
              const r = Math.sqrt(1 - Math.pow((lat - 50) / 50, 2)) * 50;
              const isLast = lat === lastLat;
              return (
                <ellipse 
                  key={`lat-${lat}`} 
                  cx="50" 
                  cy={lat} 
                  rx={r} 
                  ry={r * 0.3} 
                  strokeWidth={isLast ? 0.6 : 0.25}
                  stroke={isLast ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.7)"}
                />
              );
            })}
          </g>
        </g>
      </svg>
    );
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
      
      <Snowfall />

      {/* Page 1 Content */}
      {page === 1 && (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center animate-in fade-out duration-700 fade-in fill-mode-both">
          <main className="relative z-10 text-center px-4 max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            <div className="tracking-[0.3em] text-sm md:text-base font-light opacity-80 mb-2">
              罗杰 · 泽拉兹尼
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-widest text-serif drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              趁生命气息逗留
            </h1>
            <p className="text-sm md:text-lg leading-loose font-light opacity-90 max-w-xl mx-auto px-4 tracking-wider">
              他们叫他弗洛斯特。在上界司命所创造的一切事物中，<br className="hidden md:block" />
              弗洛斯特是最完美的，最有威力的，也是最难以理解的。
            </p>
            <div className="pt-8">
              <button 
                onClick={() => setPage(2)}
                className="group relative px-8 py-3 border border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-slate-900 transition-all duration-500 overflow-hidden cursor-pointer rounded-full"
              >
                <span className="relative z-10 text-xs md:text-sm tracking-[0.2em] font-medium">
                  追寻弗洛斯特的旅程
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>
            </div>
          </main>
          
          <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 z-30 text-sm md:text-lg font-light opacity-90 tracking-wider animate-pulse text-center w-full px-4 select-none">
            当你完成全部的旅程后，你将和弗洛斯特对话……
          </div>

          <div className="absolute bottom-[-20%] left-[-10%] w-[120%] h-[50%] pointer-events-none flex flex-col items-center">
            <div className="absolute top-0 w-full h-full rounded-[100%] border-t-[2px] border-white/40 blur-[8px] opacity-60"></div>
            <div className="absolute top-[2px] w-full h-full rounded-[100%] border-t-[1.5px] border-white/80 shadow-[0_-10px_30px_rgba(255,255,255,0.3)]"></div>
            <div className="absolute top-[4px] w-full h-full bg-gradient-to-b from-blue-400/20 via-slate-950 to-slate-950 rounded-[100%] overflow-hidden">
               <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/granite.png')]"></div>
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-full bg-[radial-gradient(ellipse_at_top,_rgba(147,197,253,0.15),_transparent_70%)]"></div>
            </div>
            <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-48 h-12 bg-white/20 blur-[20px] rounded-full"></div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 animate-pulse">
            <div className="w-px h-12 bg-gradient-to-b from-white to-transparent"></div>
            <span className="text-[10px] tracking-[0.5em] uppercase">Scroll</span>
          </div>
        </div>
      )}

      {/* Page 2 Content */}
      {page === 2 && (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 animate-in fade-in slide-in-from-right-8 duration-1000 fill-mode-both">
          <div className="max-w-4xl text-center mb-12 font-light text-white/90" style={{ fontWeight: 300, letterSpacing: '2px', lineHeight: '1.8' }}>
            <p className="text-base md:text-xl">
              一万年来，弗洛斯特始终盘踞在地球的北极，<br className="md:hidden" />
              北半球哪怕飘落一片雪花都逃不过他的耳目。
            </p>
            <p className="text-base md:text-xl">
              他指挥并监控着数以千计的重建设备和维护设备的运行。
            </p>
          </div>
          <div className="mb-32 z-30">
            <button 
              onClick={() => setPage(3)}
              className="group relative px-12 py-3 border border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-slate-900 transition-all duration-500 overflow-hidden cursor-pointer rounded-full"
            >
              <span className="relative z-10 text-xs md:text-sm tracking-[0.3em] font-medium uppercase">
                探索
              </span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </button>
          </div>
          <div className="relative w-64 h-64 md:w-96 md:h-96 group perspective-[1200px]">
            <div className="absolute top-[-140px] left-1/2 -translate-x-1/2 w-[110%] aspect-square pointer-events-none z-20 flex items-start justify-center">
              <div className="w-full h-full rounded-full border-[10px] border-blue-50/90 shadow-[0_0_50px_rgba(191,219,254,0.5)] animate-[pulse_3s_easeInOut_infinite]" style={{ transform: 'rotateX(75deg)', boxShadow: 'inset 0 0 35px rgba(191,219,254,0.3), 0 0 20px rgba(191,219,254,0.4)' }}></div>
            </div>
            <div className="absolute inset-[-30px] rounded-full border border-blue-400/5 animate-[spin_30s_linear_infinite]"></div>
            <div className="w-full h-full rounded-full relative overflow-hidden shadow-[0_0_100px_rgba(147,197,253,0.15)] ring-1 ring-white/10">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 via-slate-950 to-slate-950"></div>
              <div className="absolute inset-0 opacity-15 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/granite.png')]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.1),_transparent_60%)]"></div>
              <div className="absolute inset-0 shadow-[inset_-20px_-20px_60px_rgba(0,0,0,0.9),inset_10px_10px_40px_rgba(255,255,255,0.05)]"></div>
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-[1.5px] border-white/40 blur-[0.5px]"></div>
            </div>
          </div>
          <button onClick={() => setPage(1)} className="absolute bottom-12 text-[10px] tracking-[0.4em] uppercase opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 返回起点
          </button>
        </div>
      )}

      {/* Page 3 Content */}
      {page === 3 && (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 animate-in fade-in slide-in-from-right-8 duration-1000 fill-mode-both">
          <div className="max-w-4xl text-center mb-12 font-light text-white/90" style={{ fontWeight: 300, letterSpacing: '2px', lineHeight: '1.8' }}>
            <p className="text-base md:text-xl">
              事情是这样开始的：他将整个北极圈划分成一个个小方块，<br />
              开始一平方英寸接一平方英寸地探索这个地区。至于原因，<br />
              没有什么特别的，除了一点：他想这么做。
            </p>
          </div>

          <div className="mb-32 z-30 select-none relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg 
                className={`w-36 h-36 -rotate-90 ${isHolding || isCompleted ? 'opacity-100' : 'opacity-0'}`} 
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="0.8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeDasharray="282.74"
                  strokeDashoffset={282.74 - (282.74 * progress) / 100}
                  strokeLinecap="round"
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))',
                  }}
                />
              </svg>
            </div>
            
            <button 
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              onClick={() => {
                if (isCompleted) setPage(4);
              }}
              className={`group relative z-10 px-12 py-3 border border-white/30 bg-white/5 backdrop-blur-md active:bg-white/10 transition-all duration-500 overflow-hidden cursor-pointer rounded-full outline-none ${isCompleted ? 'hover:bg-white/10 border-white/60' : 'hover:border-white/60'}`}
            >
              <span className="relative z-10 text-xs md:text-sm tracking-[0.3em] font-medium uppercase pointer-events-none">
                {isCompleted ? '清点物品' : '发现物品'}
              </span>
              {!isCompleted && <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>}
            </button>
          </div>

          <div className="relative w-64 h-64 md:w-96 md:h-96 group perspective-[1200px]">
            <div className="absolute top-[-140px] left-1/2 -translate-x-1/2 w-[110%] aspect-square pointer-events-none z-20 flex items-start justify-center">
              <div className="w-full h-full rounded-full border-[10px] border-blue-50/90 shadow-[0_0_50px_rgba(191,219,254,0.5)] animate-[pulse_3s_easeInOut_infinite]" style={{ transform: 'rotateX(75deg)', boxShadow: 'inset 0 0 35px rgba(191,219,254,0.3), 0 0 20px rgba(191,219,254,0.4)' }}></div>
            </div>
            <div className="absolute inset-[-30px] rounded-full border border-blue-400/5 animate-[spin_30s_linear_infinite]"></div>
            <div className="w-full h-full rounded-full relative overflow-hidden shadow-[0_0_100px_rgba(147,197,253,0.15)] ring-1 ring-white/10">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 via-slate-950 to-slate-950"></div>
              
              <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none mix-blend-screen z-10 flex items-center justify-center ${progress > 0 || isCompleted ? 'opacity-90' : 'opacity-0'}`}>
                <SphereGrid revealProgress={isCompleted ? 100 : progress} />
              </div>
              
              <div className="absolute inset-0 opacity-15 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/granite.png')]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.1),_transparent_60%)]"></div>
              <div className="absolute inset-0 shadow-[inset_-20px_-20px_60px_rgba(0,0,0,0.9),inset_10px_10px_40px_rgba(255,255,255,0.05)]"></div>
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-[1.5px] border-white/40 blur-[0.5px]"></div>
            </div>
          </div>

          <button onClick={() => setPage(1)} className="absolute bottom-12 text-[10px] tracking-[0.4em] uppercase opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 返回起点
          </button>
        </div>
      )}

      {/* Page 4 Content */}
      {page === 4 && (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-start animate-in fade-in slide-in-from-right-8 duration-1000 fill-mode-both">
          <div className="w-full h-full flex flex-col items-center overflow-y-auto px-6 pt-20 pb-32 custom-scrollbar">
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
              <div className="text-center mb-12 font-light text-white/90" style={{ fontWeight: 300, letterSpacing: '2px', lineHeight: '1.8' }}>
                <p className="text-base md:text-xl">
                  过了几个世纪，弗洛斯特发现了一些物品：<br />
                  十分原始的刀子，有雕饰的象牙，诸如此类。
                </p>
              </div>

              <div className="mb-12 z-30 select-none relative flex items-center justify-center">
                <button 
                  onClick={handleExploreNext}
                  className={`group relative z-10 px-12 py-3 border border-white/30 bg-white/5 backdrop-blur-md transition-all duration-500 overflow-hidden cursor-pointer rounded-full outline-none hover:bg-white/10 hover:border-white/60`}
                >
                  <span className="relative z-10 text-xs md:text-sm tracking-[0.3em] font-medium uppercase pointer-events-none">
                    {visibleArtifactCount >= artifacts.length ? '探索完毕' : '继续探索物品'}
                  </span>
                  {visibleArtifactCount < artifacts.length && <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>}
                </button>
              </div>

              <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                {artifacts.slice(0, visibleArtifactCount).map((item, idx) => (
                  <div 
                    key={idx}
                    className="group relative flex items-center p-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-500 animate-in fade-in zoom-in-95 duration-500"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60 shadow-[0_0_8px_rgba(147,197,253,0.8)] mr-4 group-hover:scale-125 transition-transform duration-500"></div>
                    <span className="text-sm md:text-base tracking-widest font-light opacity-80 group-hover:opacity-100">
                      {item}
                    </span>
                    <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-blue-400/40 to-transparent group-hover:w-full transition-all duration-700"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => {
            setPage(1);
            setIsCompleted(false);
            setProgress(0);
            setVisibleArtifactCount(2);
          }} className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2 group z-50">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 返回起点
          </button>
          
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          `}</style>
        </div>
      )}

      {/* Page 5 Content - Artistic Final State */}
      {page === 5 && (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-[3000ms] fill-mode-both px-8 overflow-hidden">
          
          {/* Scattered Phrases - Clickable to hide with smooth fade transition */}
          {scatterPhrases.map((phrase, idx) => {
            const isHidden = hiddenPhrases.has(idx);
            return (
              <div 
                key={idx}
                onClick={() => handlePhraseClick(idx)}
                className={`${phrase.pos} cursor-pointer transition-all duration-1000 ease-in-out ${isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'} group/phrase`}
              >
                <p className="text-sm md:text-lg leading-loose font-light text-slate-200 tracking-wider opacity-70 group-hover/phrase:opacity-100 transition-opacity duration-500">
                  {phrase.text}
                </p>
              </div>
            );
          })}

          {/* Centerpiece Title */}
          <div className="text-center z-20 space-y-12">
            <h1 className="text-sm md:text-lg font-light tracking-[0.8em] text-white select-none">
              人是什么？
            </h1>

            {/* 当所有句子（7个）消失后，在下方水平并排显示两个按钮，样式完全对照第二页 */}
            {hiddenPhrases.size === scatterPhrases.length && (
              <div className="flex flex-row items-center justify-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
                <button 
                  onClick={() => {
                    setPage(1);
                    setHiddenPhrases(new Set());
                    setIsCompleted(false);
                    setProgress(0);
                    setVisibleArtifactCount(2);
                  }}
                  className="group relative px-12 py-3 border border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-slate-900 transition-all duration-500 overflow-hidden cursor-pointer rounded-full"
                >
                  <span className="relative z-10 text-xs md:text-sm tracking-[0.3em] font-medium text-white group-hover:text-slate-900 transition-colors duration-500">
                    放弃探索
                  </span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </button>

                <button 
                  onClick={() => {
                    setPage(1);
                    setHiddenPhrases(new Set());
                    setIsCompleted(false);
                    setProgress(0);
                    setVisibleArtifactCount(2);
                  }}
                  className="group relative px-12 py-3 border border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-slate-900 transition-all duration-500 overflow-hidden cursor-pointer rounded-full"
                >
                  <span className="relative z-10 text-xs md:text-sm tracking-[0.3em] font-medium text-white group-hover:text-slate-900 transition-colors duration-500">
                    继续探索
                  </span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </button>
              </div>
            )}
          </div>

          {/* Hidden reset logic (double click background to return start) */}
          <div 
            className="absolute inset-0 z-0 cursor-default" 
            onDoubleClick={() => {
              setPage(1);
              setHiddenPhrases(new Set());
              setIsCompleted(false);
              setProgress(0);
              setVisibleArtifactCount(2);
            }}
          />
        </div>
      )}

      {/* Shared Corner Details - Only show if not on the final Page 5 */}
      {page !== 5 && (
        <>
          <div className="absolute bottom-[15%] right-[10%] w-1 h-1 bg-white rounded-full blur-[1px] opacity-40 animate-pulse"></div>
          <div className="absolute bottom-[20%] right-[15%] w-[1px] h-[1px] bg-white rounded-full opacity-20"></div>
        </>
      )}
    </div>
  );
};

export default App;