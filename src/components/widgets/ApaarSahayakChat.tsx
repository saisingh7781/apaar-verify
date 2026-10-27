/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MessageSquareText,
  X,
  Send,
  Globe,
  Bot,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  HelpCircle,
  Volume2
} from 'lucide-react';

type SupportedLanguage = 'en' | 'ta' | 'hi';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const ApaarSahayakChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Multilingual Greetings & Strings
  const translations = {
    en: {
      botName: 'APAAR Sahayak',
      subtitle: 'National AICTE AI Assistant',
      greeting: 'Namaste! I am your AICTE APAAR Sahayak. How can I assist you today with student verification, seat quotas, ABC credit transfers, or privacy locks?',
      placeholder: 'Ask about APAAR ID, seat caps, ABC credits...',
      send: 'Send',
      chips: [
        'How to check seat capacity?',
        'Privacy Lock guide',
        'APAAR format rules',
        'Transfer ABC credits',
        'Ghost student audit'
      ],
      quickResponses: {
        'How to check seat capacity?':
          'You can verify any college seat quota in the "Intake Monitor" or the landing page "Sanctioned Quota Explorer". For example, PSG College has an approved intake of 90 seats; enrolling 95 triggers an automated non-compliance breach alert under AICTE APH 2026-27 Rule 4.2.',
        'Privacy Lock guide':
          'Under the Digital Personal Data Protection (DPDP) Act, open the "Citizen / Student Portal" and click the "Privacy & Consent Lock" tab. Once toggled to LOCKED, third-party recruiters cannot view your records without prior permission, and you receive an instant security SMS alert for every attempt.',
        'APAAR format rules':
          'The national APAAR / ABC ID is exactly 12 numerical digits (e.g. 1234-5678-9012). It consists of 4 digits for State Routing, 4 digits for Year/Affiliation Series, 3 digits for Sequence Number, and 1 Luhn Modulo-10 checksum digit preventing typo errors.',
        'Transfer ABC credits':
          'To transfer course credits to another university, go to the "Student Portal", click "Academic Bank of Credits (ABC) & Transfer", choose "Initiate Inter-University Credit Transfer", pick your verified courses, and submit. The AICTE Central Regulator will review and sync your credits across universities.',
        'Ghost student audit':
          'The platform uses AI anomaly detection on digital footprint, LMS login frequency (>60 days inactive), and fee payments to flag potential ghost students. Colleges with high ghost student ratios receive statutory show-cause notices recorded on the blockchain ledger.'
      }
    },
    ta: {
      botName: 'அபார் சகாயக் (APAAR Sahayak)',
      subtitle: 'தேசிய AICTE மெய்நிகர் உதவியாளர்',
      greeting: 'வணக்கம்! நான் உங்கள் AICTE அபார் சகாயக். மாணவர் சரிபார்ப்பு, கல்லூரி இருக்கை வரம்புகள், ABC கிரெடிட் பரிமாற்றம் அல்லது தனியுரிமை பூட்டு ஆகியவற்றில் நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
      placeholder: 'APAAR எண், கிரெடிட் பரிமாற்றம் குறித்து கேளுங்கள்...',
      send: 'அனுப்பு',
      chips: [
        'இருக்கை திறனை எவ்வாறு சரிபார்க்கலாம்?',
        'தனியுரிமை பூட்டு வழிகாட்டி',
        'APAAR எண் விதிகள்',
        'ABC கிரெடிட்கள் பரிமாற்றம்',
        'போலி மாணவர் தணிக்கை'
      ],
      quickResponses: {
        'இருக்கை திறனை எவ்வாறு சரிபார்க்கலாம்?':
          'நீங்கள் "Intake Monitor" பக்கத்தில் எந்த கல்லூரியின் அனுமதிக்கப்பட்ட இடங்களையும் சரிபார்க்கலாம். உதாரணமாக, PSG கல்லூரியின் அனுமதி 90 இடங்கள்; 95 மாணவர்கள் சேர்ந்தால் அது AICTE விதிகளின்படி மீறல் என தானாகவே எச்சரிக்கப்படும்.',
        'தனியுரிமை பூட்டு வழிகாட்டி':
          'மாணவர் போர்ட்டலில் (Student Portal) சென்று "Privacy & Consent Lock" டேப்பை கிளிக் செய்து உங்கள் கணக்கை பூட்டலாம். இதன் மூலம் நிறுவனங்கள் உங்கள் ஒப்புதல் இல்லாமல் சரிபார்ப்பது தடுக்கப்படும்.',
        'APAAR எண் விதிகள்':
          'APAAR அடையாள எண் என்பது இந்திய அரசின் தேசிய விதிமுறைகளின்படி சரியாக 12 இலக்கங்களை (digits) கொண்டிருக்க வேண்டும். கடைசி இலக்கம் Luhn வழிமுறையின் மூலம் சரிபார்க்கப்படுகிறது.',
        'ABC கிரெடிட்கள் பரிமாற்றம்':
          'பிற பல்கலைக்கழகங்களுக்கு கிரெடிட்களை மாற்ற, மாணவர் போர்ட்டலில் "Academic Bank of Credits & Transfer" பகுதிக்கு சென்று புதிய பல்கலைக்கழக குறியீட்டை உள்ளிட்டு சமர்ப்பிக்கலாம்.',
        'போலி மாணவர் தணிக்கை':
          '60 நாட்களுக்கு மேல் LMS தளத்தில் நுழையாத மற்றும் வருகை குறைவான மாணவர்களை கண்டறிந்து போலி சேர்க்கைகளை தடுக்கும் தணிக்கை அமைப்பு இதில் உள்ளது.'
      }
    },
    hi: {
      botName: 'अपार सहायक (APAAR Sahayak)',
      subtitle: 'राष्ट्रीय AICTE एआई सहायक',
      greeting: 'नमस्ते! मैं आपका AICTE अपार सहायक हूँ। छात्र सत्यापन, सीट कोटा, एबीसी क्रेडिट ट्रांसफर या प्राइवेसी लॉक के बारे में मैं आपकी क्या सहायता कर सकता हूँ?',
      placeholder: 'अपार आईडी, सीट क्षमता, क्रेडिट ट्रांसफर के बारे में पूछें...',
      send: 'भेजें',
      chips: [
        'सीट क्षमता कैसे जांचें?',
        'प्राइवेसी लॉक गाइड',
        'APAAR प्रारूप नियम',
        'ABC क्रेडिट ट्रांसफर',
        'घोस्ट छात्र ऑडिट'
      ],
      quickResponses: {
        'सीट क्षमता कैसे जांचें?':
          'आप "Intake Monitor" या मुख्य पृष्ठ पर किसी भी कॉलेज की स्वीकृत सीट क्षमता जांच सकते हैं। उदाहरण के लिए, पीएसजी कॉलेज में 90 सीटों की स्वीकृति है; 95 नामांकन होने पर AICTE APH 2026-27 के तहत उल्लंघन दर्ज होता है।',
        'प्राइवेसी लॉक गाइड':
          'छात्र पोर्टल (Student Portal) में जाकर "Privacy & Consent Lock" टैब चुनें। इसे लॉक करने पर बाहरी कंपनियां आपकी सहमति के बिना क्रेडेंशियल नहीं देख सकतीं और आपको तुरंत एसएमएस अलर्ट मिलेगा।',
        'APAAR प्रारूप नियम':
          'राष्ट्रीय अपार आईडी 12 अंकों का एक अद्वितीय पहचानकर्ता है (जैसे 1234-5678-9012)। इसका 12वां अंक लुह्न चेकसम (Luhn Modulo-10) द्वारा सत्यापित होता है।',
        'ABC क्रेडिट ट्रांसफर':
          'दूसरे विश्वविद्यालय में क्रेडिट स्थानांतरित करने के लिए छात्र पोर्टल में "Academic Bank of Credits & Transfer" में जाएं और "Initiate Inter-University Credit Transfer" पर क्लिक करें।',
        'घोस्ट छात्र ऑडिट':
          'यह प्रणाली 60 दिनों से अधिक एलएमएस लॉगिन न करने वाले और कम उपस्थिति वाले छात्रों का पता लगाकर घोस्ट छात्रों पर शो-कॉज नोटिस जारी करती है।'
      }
    }
  };

  const currentLangData = translations[language];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: currentLangData.greeting,
      timestamp: 'Just now'
    }
  ]);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    const newLang = translations[lang];
    setMessages(prev => [
      ...prev,
      {
        id: `lang-${Date.now()}`,
        sender: 'bot',
        text: `Language switched to ${lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : 'हिंदी'}. ${newLang.greeting}`,
        timestamp: 'Just now'
      }
    ]);
  };

  const handleSendQuestion = (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Rule-based answer match
    setTimeout(() => {
      let reply = '';
      const lower = questionText.toLowerCase();

      // Check quick response keys first
      const matchedKey = Object.keys(currentLangData.quickResponses).find(k =>
        questionText.includes(k) || k.includes(questionText)
      );

      if (matchedKey) {
        reply = (currentLangData.quickResponses as any)[matchedKey];
      } else if (lower.includes('seat') || lower.includes('capacity') || lower.includes('intake') || lower.includes('இருக்கை') || lower.includes('सीट')) {
        reply = currentLangData.quickResponses['How to check seat capacity?' as keyof typeof currentLangData.quickResponses] || currentLangData.greeting;
      } else if (lower.includes('lock') || lower.includes('privacy') || lower.includes('dpdp') || lower.includes('consent') || lower.includes('பூட்டு') || lower.includes('गोपनीयता')) {
        reply = currentLangData.quickResponses['Privacy Lock guide' as keyof typeof currentLangData.quickResponses] || currentLangData.greeting;
      } else if (lower.includes('transfer') || lower.includes('abc') || lower.includes('credit') || lower.includes('கிரெடிட்') || lower.includes('क्रेडिट')) {
        reply = currentLangData.quickResponses['Transfer ABC credits' as keyof typeof currentLangData.quickResponses] || currentLangData.greeting;
      } else if (lower.includes('ghost') || lower.includes('fake') || lower.includes('dropout') || lower.includes('போலி') || lower.includes('घोस्ट')) {
        reply = currentLangData.quickResponses['Ghost student audit' as keyof typeof currentLangData.quickResponses] || currentLangData.greeting;
      } else {
        reply = currentLangData.quickResponses['APAAR format rules' as keyof typeof currentLangData.quickResponses] || currentLangData.greeting;
      }

      const botReply: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: reply,
        timestamp: 'Just now'
      };

      setMessages(prev => [...prev, botReply]);
    }, 300);
  };

  const handleSimulateTts = () => {
    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 2000);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* 1. Floating Circle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 text-white p-0.5 shadow-2xl hover:scale-105 transition-all cursor-pointer flex items-center justify-center group relative"
          aria-label="Open APAAR Sahayak Assistant"
        >
          <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center group-hover:bg-slate-900 transition">
            <Bot className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform" />
          </div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
        </button>
      )}

      {/* 2. Expanded Chat Drawer */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white leading-tight">
                  {currentLangData.botName}
                </h4>
                <span className="text-[10px] text-slate-400 block">
                  {currentLangData.subtitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switcher Dropdown */}
              <div className="relative flex items-center">
                <Globe className="w-3.5 h-3.5 text-slate-400 mr-1" />
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-[10px] cursor-pointer focus:outline-hidden"
                >
                  <option value="en">English</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs scrollbar-thin">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                      isUser
                        ? 'bg-amber-600 text-white rounded-tr-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Question Chips */}
          <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800/80 overflow-x-auto scrollbar-none flex gap-1.5">
            {currentLangData.chips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendQuestion(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[10px] font-medium transition cursor-pointer shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion(inputText);
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={currentLangData.placeholder}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleSimulateTts}
              className={`p-2 rounded-xl text-slate-300 hover:text-white transition cursor-pointer ${
                isSpeaking ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800'
              }`}
              title="Read aloud (TTS simulation)"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="submit"
              className="p-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white transition cursor-pointer shadow-md"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
