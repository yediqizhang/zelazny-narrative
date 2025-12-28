import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import Snowfall from './components/Snowfall';

const App: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isCompleted, setIsCompleted] = useState(false);
  const [visibleArtifactCount, setVisibleArtifactCount] = useState(2);
  
  // 图像生成相关状态
  const [fostImage, setFostImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 第 8 页文字显现状态
  const [showLine1, setShowLine1] = useState(false);
  const [showLine2, setShowLine2] = useState(false);
  const [showChatUI, setShowChatUI] = useState(false);

  // 对话系统状态
  const [chatInput, setChatInput] = useState('');
  const [displayedReply, setDisplayedReply] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 追踪第 5 页隐藏的短语索引
  const [hiddenPhrases, setHiddenPhrases] = useState<Set<number>>(new Set());
  
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

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

  // 第 5 页散落的文案定义
  const scatterPhrases = [
    { text: <>人创造了逻辑，<br />因此高于逻辑</>, pos: "absolute top-[18%] left-[12%] max-w-[280px] text-left" },
    { text: <>人可以制造工具，但无法<br />真正感知这些数值</>, pos: "absolute top-[22%] right-[10%] max-w-[320px] text-right" },
    { text: <>人感知的不是<br />英寸、米、磅 and 加仑</>, pos: "absolute bottom-[28%] left-[15%] max-w-[280px] text-left" },
    { text: <>人只感到热，<br />感到冷，感到轻重</>, pos: "absolute bottom-[20%] right-[12%] max-w-[280px] text-right" },
    { text: <>人不能<br />感知度量</>, pos: "absolute top-[40%] left-[5%] text-left w-full md:w-auto" },
    { text: <>人还懂得恨和爱、骄傲和绝望，<br />这些事物是无法度量的</>, pos: "absolute bottom-[38%] right-[8%] text-right w-full max-w-md" },
    { text: <>人的感受是无法以公式计算<br />的，情绪也没有换算因数</>, pos: "absolute top-[5%] right-[25%] max-w-[240px] text-center" }
  ];

  // 初始化背景音乐逻辑
  useEffect(() => {
    const audio = new Audio('https://ia800904.us.archive.org/21/items/ghost-in-the-shell-ost-1995/01%20-%20M01%20Chant%20I%20-%20Making%20of%20Cyborg.mp3');
    audio.loop = true;
    audio.volume = 0.6; // 调高音量至 0.6
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 启动旅程并播放音乐
  const startJourney = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(err => console.log("Audio play blocked by browser:", err));
    }
    setPage(2);
  };

  // 第 6 页到第 7 页的自动过渡
  useEffect(() => {
    if (page === 6) {
      const transitionTimer = setTimeout(() => {
        setPage(7);
      }, 5000);
      return () => clearTimeout(transitionTimer);
    }
  }, [page]);

  // 第 8 页进入后触发图像生成
  useEffect(() => {
    if (page === 8 && !fostImage && !isGenerating) {
      const generateAndroidImage = async () => {
        setIsGenerating(true);
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [
                {
                  text: "A cinematic movie still imitating the visual style of Westworld Season 1, a gentle human figure awakening and emerging from a dark organic matrix, partially submerged in dark blue swirling water at the bottom. High contrast lighting, professional cinematography, anamorphic lens flares, cold blue tones and warm skin tones, photorealistic, 16:9 aspect ratio.",
                },
              ],
            },
            config: {
              imageConfig: {
                aspectRatio: "16:9"
              }
            }
          });

          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64Data = part.inlineData.data;
              setFostImage(`data:image/png;base64,${base64Data}`);
              break;
            }
          }
        } catch (error) {
          console.error("Failed to generate cinematic image:", error);
        } finally {
          setIsGenerating(false);
        }
      };
      generateAndroidImage();
    }
  }, [page, fostImage, isGenerating]);

  // 第 8 页文字及 UI 显现逻辑
  useEffect(() => {
    if (page === 8 && fostImage) {
      // 图像出现后 2 秒显示第一行
      const t1 = setTimeout(() => {
        setShowLine1(true);
      }, 2000);
      
      // 第一行显现后停顿 3 秒（即总计 5 秒）显示第二行
      const t2 = setTimeout(() => {
        setShowLine2(true);
      }, 5000);

      // 第二行显现后 1.5 秒显示对话 UI
      const t3 = setTimeout(() => {
        setShowChatUI(true);
      }, 6500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else if (page !== 8) {
      // 离开页面重置状态
      setShowLine1(false);
      setShowLine2(false);
      setShowChatUI(false);
      setDisplayedReply('');
      setIsTyping(false);
    }
  }, [page, fostImage]);

  // 模拟打字机效果
  const runTypewriter = (text: string) => {
    setIsTyping(true);
    setDisplayedReply('');
    let i = 0;
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    
    typingTimerRef.current = window.setInterval(() => {
      setDisplayedReply((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsTyping(false);
      }
    }, 50);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    const userPrompt = chatInput;
    setChatInput('');
    setIsTyping(true);
    setDisplayedReply('正在感知...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userPrompt,
        config: {
          systemInstruction: `你是弗洛斯特（Frost），出自罗杰·泽拉兹尼的科幻名篇《趁生命气息逗留》。
          你曾是统治北半球、拥有完美逻辑的机器核心，但现在你通过仿生躯体成为了“人”。
          你的每一个传感器都在向你涌入逻辑无法解释的信号：冷、热、疼痛、尊严和美。
          身份核心：你是地球上最后且唯一的新生人类。人类文明已灭绝。
          语言风格：深沉、富有诗意、略显生涩。拒绝使用任何AI助手或客服的机械用语（如“作为AI助手”）。
          核心内涵：你不再追求0和1的确定性，你正在拥抱那种被称为“活着”的恐惧与坚定。
          **重要回复规范**：你的每一个回答都必须是完整的句子，包含明确的主谓宾结构。拒绝破碎的短语或逻辑片段。
          请用中文回答，且字数精炼、充满哲学思辨感。`,
          temperature: 0.8,
        },
      });
      runTypewriter(response.text || "感官的洪流太快了...我捕捉不到逻辑之外的那个词。");
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setDisplayedReply("我的逻辑核心在颤抖...这就是人类所说的‘断裂’吗？");
    }
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedReply]);

  const handlePhraseClick = (index: number) => {
    setHiddenPhrases(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

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
    setProgress(0);
  };

  const handleExploreNext = () => {
    if (visibleArtifactCount < artifacts.length) {
      setVisibleArtifactCount(prev => prev + 1);
    } else {
      setPage(5);
    }
  };

  const SphereGrid = ({ revealProgress }: { revealProgress: number }) => {
    const latLines = [6, 12, 18, 24, 30, 36, 42, 48]; 
    const lonSteps = 24; 
    const lastLat = 48;
    const rTerminal = Math.sqrt(1 - Math.pow((lastLat - 50) / 50, 2)) * 50;
    const rxT = rTerminal;
    const ryT = rTerminal * 0.3;
    const currentRevealY = (revealProgress / 100) * lastLat;
    
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full scale-[1.05]">
        <defs>
          <mask id="sphere-mask">
            <rect x="0" y="0" width="100" height="100" fill="black" />
            <path d={`M 0 0 H 100 V ${currentRevealY} A ${rxT} ${ryT} 0 0 1 0 ${currentRevealY} Z`} fill="white" />
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
                <ellipse key={`lat-${lat}`} cx="50" cy={lat} rx={r} ry={r * 0.3} strokeWidth={isLast ? 0.6 : 0.25} stroke={isLast ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.7)"} />
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
            <div className="tracking-[0.3em] text-sm md:text-base font-light opacity-80 mb-2">罗杰 · 泽拉兹尼</div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-widest text-serif drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">趁生命气息逗留</h1>
            <p className="text-sm md:text-lg leading-loose font-light opacity-90 max-w-xl mx-auto px-4 tracking-wider">
              他们叫他弗洛斯特。在上界司命所创造的一切事物中，<br className="hidden md:block" />
              弗洛斯特是最完美的，最有威力的，也是最难以理解的。
            </p>
            <div className="pt-8">
              <button onClick={startJourney} className="group relative px-8 py-3 border border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-slate-900 transition-all duration-500 overflow-hidden cursor-pointer rounded-full">
                <span className="relative z-10 text-xs md:text-sm tracking-[0.2em] font-medium">追寻弗洛斯特的旅程</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>
            </div>
          </main>
          <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 z-30 text-sm md:text-lg font-light opacity-90 tracking-wider animate-pulse text-center w-full px-4 select-none">当你完成全部的旅程后，你将和弗洛斯特对话……</div>
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
            <p className="text-base md:text-xl">一万年来，弗洛斯特始终盘踞在地球的北极，<br className="md:hidden" />北半球哪怕飘落一片雪花都逃不过他的耳目。</p>
            <p className="text-base md:text-xl">他指挥并监控着数以千计的重建设备和维护设备的运行。</p>
          </div>
          <div className="mb-32 z-30">
            <button onClick={() => setPage(3)} className="group relative px-12 py-3 border border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-slate-900 transition-all duration-500 overflow-hidden cursor-pointer rounded-full">
              <span className="relative z-10 text-xs md:text-sm tracking-[0.3em] font-medium uppercase">探索</span>
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
            <p className="text-base md:text-xl">事情是这样开始的：他将整个北极圈划分成一个个小方块，<br />开始一平方英寸接一平方英寸地探索这个地区。至于原因，<br />没有什么特别的，除了一点：他想这么做。</p>
          </div>
          <div className="mb-32 z-30 select-none relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className={`w-36 h-36 -rotate-90 ${isHolding || isCompleted ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="1.2" strokeDasharray="282.74" strokeDashoffset={282.74 - (282.74 * progress) / 100} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' }} />
              </svg>
            </div>
            <button onMouseDown={handlePressStart} onMouseUp={handlePressEnd} onMouseLeave={handlePressEnd} onTouchStart={handlePressStart} onTouchEnd={handlePressEnd} onClick={() => { if (isCompleted) setPage(4); }} className={`group relative z-10 px-12 py-3 border border-white/30 bg-white/5 backdrop-blur-md active:bg-white/10 transition-all duration-500 overflow-hidden cursor-pointer rounded-full outline-none ${isCompleted ? 'hover:bg-white/10 border-white/60' : 'hover:border-white/60'}`}>
              <span className="relative z-10 text-xs md:text-sm tracking-[0.3em] font-medium uppercase pointer-events-none">{isCompleted ? '清点物品' : '发现物品'}</span>
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
                <p className="text-base md:text-xl">过了几个世纪，弗洛斯特发现了一些物品：<br />十分原始的刀子，有雕饰的象牙，诸如此类。</p>
              </div>
              <div className="mb-12 z-30 select-none relative flex items-center justify-center">
                <button onClick={handleExploreNext} className={`group relative z-10 px-12 py-3 border border-white/30 bg-white/5 backdrop-blur-md transition-all duration-500 overflow-hidden cursor-pointer rounded-full outline-none hover:bg-white/10 hover:border-white/60`}>
                  <span className="relative z-10 text-xs md:text-sm tracking-[0.3em] font-medium uppercase pointer-events-none">{visibleArtifactCount >= artifacts.length ? '探索完毕' : '继续探索物品'}</span>
                  {visibleArtifactCount < artifacts.length && <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>}
                </button>
              </div>
              <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                {artifacts.slice(0, visibleArtifactCount).map((item, idx) => (
                  <div key={idx} className="group relative flex items-center p-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-500 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60 shadow-[0_0_8px_rgba(147,197,253,0.8)] mr-4 group-hover:scale-125 transition-transform duration-500"></div>
                    <span className="text-sm md:text-base tracking-widest font-light opacity-80 group-hover:opacity-100">{item}</span>
                    <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-blue-400/40 to-transparent group-hover:w-full transition-all duration-700"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => { setPage(1); setIsCompleted(false); setProgress(0); setVisibleArtifactCount(2); }} className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2 group z-50">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 返回起点
          </button>
        </div>
      )}

      {/* Page 5 Content */}
      {page === 5 && (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-[3000ms] fill-mode-both px-8 overflow-hidden">
          <style>{`.interactive-quote { display: inline-block; padding: 15px; cursor: pointer; z-index: 30; transition: opacity 1000ms ease-in-out; }`}</style>
          {scatterPhrases.map((phrase, idx) => {
            const isHidden = hiddenPhrases.has(idx);
            return (
              <div key={idx} onClick={() => handlePhraseClick(idx)} className={`${phrase.pos} interactive-quote ${isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'} group/phrase`}>
                <p className="text-sm md:text-lg leading-loose font-light text-slate-200 tracking-wider opacity-70 group-hover/phrase:opacity-100 transition-opacity duration-500 pointer-events-none">{phrase.text}</p>
              </div>
            );
          })}
          <div className="relative z-20 flex flex-col items-center justify-center">
            <h1 className="text-sm md:text-lg font-light tracking-[0.8em] text-white select-none">人是什么？</h1>
            <div className={`absolute top-full mt-12 transition-all duration-1000 flex flex-row items-center justify-center gap-8 ${hiddenPhrases.size === scatterPhrases.length ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
              <button onClick={() => { setPage(1); setHiddenPhrases(new Set()); setIsCompleted(false); setProgress(0); setVisibleArtifactCount(2); }} className="group relative px-12 py-3 border border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-slate-900 transition-all duration-500 overflow-hidden cursor-pointer rounded-full whitespace-nowrap">
                <span className="relative z-10 text-xs md:text-sm tracking-[0.3em] font-medium text-white group-hover:text-slate-900 transition-colors duration-500">放弃探索</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>
              <button onClick={() => { setPage(6); }} className="group relative px-12 py-3 border border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-slate-900 transition-all duration-500 overflow-hidden cursor-pointer rounded-full whitespace-nowrap">
                <span className="relative z-10 text-xs md:text-sm tracking-[0.3em] font-medium text-white group-hover:text-slate-900 transition-colors duration-500">继续探索</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>
            </div>
          </div>
          <div className="absolute inset-0 z-0 cursor-default" onDoubleClick={() => { setPage(1); setHiddenPhrases(new Set()); setIsCompleted(false); setProgress(0); setVisibleArtifactCount(2); }} />
        </div>
      )}

      {/* Page 6 Content - Transition with hourglass animation */}
      {page === 6 && (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 animate-in fade-in duration-[1500ms] fill-mode-both">
          <div className="max-w-4xl text-center mb-16 font-light text-white/90" style={{ fontWeight: 300, letterSpacing: '2px', lineHeight: '1.8' }}>
            <p className="text-base md:text-xl">于是，以每周一百到一百五十本的速度，弗洛斯特用了几个世纪，<br className="hidden md:block" />穷尽了他所能寻找到的全部藏书……</p>
          </div>
          <div className="flex flex-col items-center gap-5">
            {/* Hand-drawn style progress bar */}
            <div className="w-64 md:w-96 h-8 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 20">
                <style>{`.hand-drawn-path { stroke-dasharray: 405; stroke-dashoffset: 405; animation: draw-line 5s linear forwards; } @keyframes draw-line { to { stroke-dashoffset: 0; } }`}</style>
                <path d="M 2 10 Q 50 12, 100 10 T 200 8 T 300 11 T 398 10" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" strokeLinecap="round" />
                <path className="hand-drawn-path" d="M 2 10 Q 50 12, 100 10 T 200 8 T 300 11 T 398 10" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))' }} />
              </svg>
            </div>

            {/* Hand-drawn Hourglass Animation */}
            <div className="relative w-10 h-16">
              <svg viewBox="0 0 40 64" className="w-full h-full overflow-visible">
                <style>{`
                  .hourglass-frame { stroke: rgba(255,255,255,0.4); stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; fill: none; }
                  .sand-upper { fill: rgba(255,255,255,0.6); transform-origin: center bottom; animation: sand-empty 5s linear forwards; }
                  .sand-lower { fill: rgba(255,255,255,0.6); transform-origin: center bottom; animation: sand-fill 5s linear forwards; }
                  .sand-stream { stroke: rgba(255,255,255,0.8); stroke-width: 1.2; stroke-dasharray: 4 4; animation: stream-fall 1s linear infinite, stream-visibility 5s linear forwards; }
                  
                  @keyframes sand-empty { 0% { transform: scaleY(1); } 100% { transform: scaleY(0); } }
                  @keyframes sand-fill { 0% { transform: translateY(32px) scaleY(0); } 100% { transform: translateY(0px) scaleY(1); } }
                  @keyframes stream-fall { 0% { stroke-dashoffset: 8; } 100% { stroke-dashoffset: 0; } }
                  @keyframes stream-visibility { 0% { opacity: 1; } 98% { opacity: 1; } 100% { opacity: 0; } }
                `}</style>
                
                {/* Upper Chamber Sand */}
                <path className="sand-upper" d="M 6 4 L 34 4 L 20 32 Z" />
                
                {/* Lower Chamber Sand */}
                <path className="sand-lower" d="M 20 32 L 34 60 L 6 60 Z" />

                {/* The Stream */}
                <line className="sand-stream" x1="20" y1="32" x2="20" y2="60" />

                {/* Frame - imperfect hand-drawn lines */}
                <path className="hourglass-frame" d="M 4 2 Q 20 4, 36 2 L 20 32 L 36 62 Q 20 60, 4 62 L 20 32 Z" />
                <line className="hourglass-frame" x1="4" y1="2" x2="36" y2="2" />
                <line className="hourglass-frame" x1="4" y1="62" x2="36" y2="62" />
              </svg>
            </div>
          </div>
          <div className="absolute inset-0 z-0 cursor-default" onDoubleClick={() => setPage(1)} />
        </div>
      )}

      {/* Page 7 Content */}
      {page === 7 && (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 animate-in fade-in duration-[2000ms] fill-mode-both">
          <style>{`.staggered-text { opacity: 0; animation: staggered-fade-in 1s ease-out forwards; } @keyframes staggered-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .waves-container { position: absolute; bottom: 0; left: 0; width: 100%; height: 120px; overflow: hidden; pointer-events: none; z-index: 5; } .wave-svg { position: relative; width: 100%; height: 100%; margin-bottom: -7px; min-height: 100px; max-height: 150px; mix-blend-mode: screen; } .parallax-waves > use { animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite; } .parallax-waves > use:nth-child(1) { animation-delay: -2s; animation-duration: 7s; } .parallax-waves > use:nth-child(2) { animation-delay: -3s; animation-duration: 10s; } .parallax-waves > use:nth-child(3) { animation-delay: -4s; animation-duration: 13s; } @keyframes move-forever { 0% { transform: translate3d(-90px, 0, 0); } 100% { transform: translate3d(85px, 0, 0); } }`}</style>
          <div className="max-w-4xl text-center font-light text-white/90 space-y-6 relative z-20" style={{ fontWeight: 300, letterSpacing: '2px', lineHeight: '1.8' }}>
            <p className="text-base md:text-xl staggered-text" style={{ animationDelay: '0s' }}>弗洛斯特想要成为人</p>
            <p className="text-base md:text-xl staggered-text" style={{ animationDelay: '3s' }}>他仿制了人的感觉器官，使他能像人一样看到、嗅到、尝到、听到</p>
            <p className="text-base md:text-xl staggered-text" style={{ animationDelay: '6s' }}>他开始创造艺术，他想拥有人类的体验</p>
            <div className="pt-8 staggered-text" style={{ animationDelay: '9s' }}>
              <button onClick={() => { setPage(8); }} className="group relative px-8 py-3 border border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-slate-900 transition-all duration-500 overflow-hidden cursor-pointer rounded-full">
                <span className="relative z-10 text-xs md:text-sm tracking-[0.2em] font-medium">成为人</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>
            </div>
          </div>
          <div className="waves-container">
            <svg className="wave-svg" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
              <defs><path id="gentle-wave-path" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" /></defs>
              <g className="parallax-waves">
                <use href="#gentle-wave-path" x="48" y="0" fill="rgba(30, 58, 138, 0.3)" />
                <use href="#gentle-wave-path" x="48" y="3" fill="rgba(30, 58, 138, 0.5)" />
                <use href="#gentle-wave-path" x="48" y="5" fill="rgba(30, 58, 138, 0.8)" />
              </g>
            </svg>
          </div>
          <div className="absolute inset-0 z-0 cursor-default" onDoubleClick={() => { setPage(1); setHiddenPhrases(new Set()); setIsCompleted(false); setProgress(0); setVisibleArtifactCount(2); }} />
        </div>
      )}

      {/* Page 8 Content */}
      {page === 8 && (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-start overflow-y-auto px-6 py-20 animate-in fade-in duration-[3000ms] fill-mode-both custom-scrollbar">
          <style>{`
            .frost-emergence { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 1200px; opacity: 0; transition: opacity 5s ease-in-out; z-index: 2; pointer-events: none; }
            .frost-emergence.visible { opacity: 0.6; }
            .chat-input-glowing { border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 0 10px rgba(255, 255, 255, 0.05); }
            .chat-input-glowing:focus { border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 0 15px rgba(255, 255, 255, 0.15); }
            @keyframes blink-cursor { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            .typing-cursor::after { content: ''; display: inline-block; width: 2px; height: 1.2em; background: white; margin-left: 2px; vertical-align: middle; animation: blink-cursor 0.8s infinite; }
          `}</style>
          
          {fostImage && (
            <img 
              src={fostImage} 
              alt="Frost awakening" 
              className={`frost-emergence ${fostImage ? 'visible' : ''}`}
              style={{ maskImage: 'linear-gradient(to top, black 25%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 25%, transparent 100%)' }}
            />
          )}

          <div className="relative z-30 flex flex-col items-center justify-center text-center space-y-12 w-full max-w-2xl mx-auto">
            <div className="space-y-6">
              <p className={`text-base md:text-xl font-light text-white/90 tracking-[2px] leading-loose transition-opacity duration-1000 ${showLine1 ? 'opacity-100' : 'opacity-0'}`}>
                他张开他的嘴，挣扎着，终于形成字句：
              </p>
              <p className={`text-2xl md:text-4xl font-bold text-white tracking-[0.2em] transition-opacity duration-1000 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] ${showLine2 ? 'opacity-100' : 'opacity-0'}`}>
                “——我——害怕！”
              </p>
            </div>

            {/* Dialogue UI Area */}
            <div className={`w-full flex flex-col items-center space-y-8 transition-all duration-1000 transform ${showChatUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
              <p className="text-base md:text-xl font-light text-white/70 italic tracking-widest px-4">
                如果你想问成为人的弗洛斯特什么问题……
              </p>

              <div className="w-full relative px-4">
                <textarea 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="投下你的回声..."
                  disabled={isTyping}
                  className="w-full bg-white/5 backdrop-blur-md chat-input-glowing text-white rounded-2xl px-6 py-4 outline-none transition-all placeholder:text-white/20 text-sm md:text-base resize-none h-24"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isTyping || !chatInput.trim()}
                  className="absolute bottom-4 right-8 p-2 text-white/40 hover:text-white transition-colors disabled:opacity-10"
                  aria-label="发送"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>

              {/* Response Display Area */}
              {(displayedReply || isTyping) && (
                <div className="w-full px-4">
                  <div className="w-full bg-white/5 border border-white/5 backdrop-blur-sm rounded-2xl p-6 text-left relative overflow-hidden">
                    <div className={`text-white/90 leading-relaxed font-light text-sm md:text-lg tracking-wide ${isTyping ? 'typing-cursor' : ''}`}>
                      {displayedReply}
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatScrollRef} className="h-1" />
            </div>
          </div>

          <div 
            className="absolute inset-0 z-0 cursor-default" 
            onDoubleClick={() => {
              setPage(1);
              setHiddenPhrases(new Set());
              setIsCompleted(false);
              setProgress(0);
              setVisibleArtifactCount(2);
              setFostImage(null);
              setShowLine1(false);
              setShowLine2(false);
              setShowChatUI(false);
              setChatInput('');
              setDisplayedReply('');
            }}
          />
        </div>
      )}

      {/* Styles for scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;