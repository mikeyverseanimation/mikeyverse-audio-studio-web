import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Mic,
  Users,
  User,
  Sliders,
  Volume2,
  Play,
  Pause,
  Download,
  Upload,
  Trash2,
  FileAudio,
  Sparkles,
  Wand2,
  FileText,
  FolderHeart,
  Settings,
  Radio,
  CheckCircle2,
  AlertCircle,
  Info,
  Code2,
  Copy,
  Check,
  ChevronRight,
  Globe,
  Gauge,
  Smile,
  MessageSquare,
  Headphones,
  Layers,
  ShieldCheck,
  Terminal,
  RefreshCw,
  Plus,
  X,
  Eye,
  Music,
  Clock,
  ArrowUpRight
} from 'lucide-react';

// ============================================================================
// DATA KONFIGURASI STUDIO & KATALOG SUARA (SIAP INTEGRASI GEMINI TTS API)
// ============================================================================

const VOICE_LIBRARY_DATA = [
  {
    id: 'Kore',
    name: 'Kore',
    characteristic: 'Firm & Authoritative',
    badge: 'Pro Studio',
    languages: ['id-ID', 'en-US', 'ja-JP', 'ko-KR'],
    defaultStyle: 'Narasi Profesional',
    description: ' Karakter suara tegas, jernih, dan berwibawa. Sangat cocok untuk narasi dokumenter, presentasi korporat, dan edukasi.'
  },
  {
    id: 'Puck',
    name: 'Puck',
    characteristic: 'Upbeat & Energetic',
    badge: 'Popular',
    languages: ['id-ID', 'en-US', 'es-US', 'fr-FR'],
    defaultStyle: 'Iklan Komersial',
    description: 'Nada suara hidup, dinamis, dan bersahabat. Ideal untuk konten kreator, iklan digital, dan dialog karakter animasi.'
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    characteristic: 'Bright & Clear',
    badge: 'HD Voice',
    languages: ['id-ID', 'en-US', 'en-GB', 'de-DE'],
    defaultStyle: 'Podcast Host',
    description: 'Artikulasi sangat terang dan natural dengan intonasi percakapan modern yang nyaman didengar dalam durasi panjang.'
  },
  {
    id: 'Charon',
    name: 'Charon',
    characteristic: 'Deep & Informative',
    badge: 'Cinema',
    languages: ['id-ID', 'en-US', 'ar-EG', 'hi-IN'],
    defaultStyle: 'Storytelling Sinematik',
    description: 'Timbre suara dalam, tenang, dan penuh dimensi untuk pembawaan cerita sinematik, audiobook, maupun berita.'
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    characteristic: 'Excitable & Dynamic',
    badge: 'Animation',
    languages: ['id-ID', 'en-US', 'ja-JP'],
    defaultStyle: 'Karakter Animasi',
    description: 'Ekspresif dan penuh energi, dirancang untuk kebutuhan sulih suara (dubbing) karakter animasi dan game.'
  },
  {
    id: 'Aoede',
    name: 'Aoede',
    characteristic: 'Breezy & Warm',
    badge: 'Natural',
    languages: ['id-ID', 'en-US', 'fr-FR', 'es-US'],
    defaultStyle: 'Percakapan Santai',
    description: 'Suara lembut, mengalir alami, dan hangat. Memberikan kesan intim untuk narasi cerita maupun asisten virtual.'
  },
  {
    id: 'Leda',
    name: 'Leda',
    characteristic: 'Youthful & Expressive',
    badge: 'Animation',
    languages: ['id-ID', 'en-US', 'ko-KR', 'ja-JP'],
    defaultStyle: 'Karakter Animasi',
    description: 'Warna suara muda, ceria, dan responsif terhadap arahan emosi untuk naskah fiksi dan cerita remaja.'
  },
  {
    id: 'Sulafat',
    name: 'Sulafat',
    characteristic: 'Warm & Empathetic',
    badge: 'Storyteller',
    languages: ['id-ID', 'en-US', 'ar-EG'],
    defaultStyle: 'Storytelling Sinematik',
    description: 'Tone suara penuh empati dengan resonansi hangat untuk narasi reflektif dan puisi audio.'
  }
];

const SUPPORTED_LANGUAGES = [
  { code: 'id-ID', label: 'Bahasa Indonesia (id-ID)' },
  { code: 'en-US', label: 'English - United States (en-US)' },
  { code: 'en-GB', label: 'English - United Kingdom (en-GB)' },
  { code: 'ja-JP', label: 'Japanese - 日本語 (ja-JP)' },
  { code: 'ko-KR', label: 'Korean - 한국어 (ko-KR)' },
  { code: 'ar-EG', label: 'Arabic - العربية (ar-EG)' },
  { code: 'es-US', label: 'Spanish - Español (es-US)' },
  { code: 'fr-FR', label: 'French - Français (fr-FR)' },
  { code: 'de-DE', label: 'German - Deutsch (de-DE)' },
  { code: 'hi-IN', label: 'Hindi - हिन्दी (hi-IN)' }
];

const VOICE_STYLES = [
  'Narasi Profesional',
  'Storytelling Sinematik',
  'Karakter Animasi',
  'Berita & Dokumenter',
  'Percakapan Santai',
  'Iklan Komersial',
  'Podcast Host'
];

const VOICE_EMOTIONS = [
  'Netral & Seimbang',
  'Antusias & Ceria',
  'Tenang & Hangat',
  'Serius & Tegas',
  'Empatik & Lembut',
  'Misterius & Dramatis',
  'Bersemangat / Epik'
];

const SUPPORTED_AUDIO_FORMATS = [
  { ext: 'WAV', mime: 'audio/wav', desc: 'Uncompressed PCM (Rekomendasi Utama)' },
  { ext: 'MP3', mime: 'audio/mpeg', desc: 'MPEG Layer-3 Audio' },
  { ext: 'FLAC', mime: 'audio/flac', desc: 'Free Lossless Audio Codec' },
  { ext: 'OGG', mime: 'audio/ogg', desc: 'Ogg Vorbis Audio Container' },
  { ext: 'M4A / AAC', mime: 'audio/mp4', desc: 'Advanced Audio Coding' }
];

// ============================================================================
// UTILITAS KONVERSI PCM16 KE WAV (SIAP DIGUNAKAN SAAT BACKEND GEMINI TTS AKTIF)
// ============================================================================

/**
 * Mengonversi raw signed 16-bit PCM (output standar Gemini TTS API) menjadi Blob WAV asli.
 * Tidak menghasilkan audio simulasi; hanya dipanggil ketika backend mengembalikan byte PCM asli.
 */
export function convertPcm16Base64ToWavBlob(base64Pcm, sampleRate = 24000) {
  const binaryString = window.atob(base64Pcm);
  const pcmByteLength = binaryString.length;
  const wavBuffer = new ArrayBuffer(44 + pcmByteLength);
  const view = new DataView(wavBuffer);

  const writeAscii = (offset, text) => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  // Header standar RIFF WAVE PCM 16-bit Mono
  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + pcmByteLength, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 untuk PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 = Linear PCM)
  view.setUint16(22, 1, true);  // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true);  // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16-bit)
  writeAscii(36, 'data');
  view.setUint32(40, pcmByteLength, true);

  const pcmBytes = new Uint8Array(wavBuffer, 44);
  for (let i = 0; i < pcmByteLength; i++) {
    pcmBytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

// ============================================================================
// KOMPONEN REUSABLE UI STUDIO
// ============================================================================

/**
 * Komponen Card Kontainer bergaya Rack Studio Profesional
 */
const StudioCard = ({ title, subtitle, icon: Icon, badge, children, className = '', headerAction }) => (
  <section
    className={`bg-[#0E1424]/90 border border-violet-500/20 rounded-2xl shadow-xl shadow-black/40 backdrop-blur-md overflow-hidden transition-all duration-200 hover:border-violet-400/30 ${className}`}
  >
    {(title || Icon) && (
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-[#141C33] via-[#19153A] to-[#141C33] border-b border-violet-500/15 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-violet-950/80 border border-violet-400/30 flex items-center justify-center text-violet-300 shadow-inner">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm sm:text-base font-semibold tracking-wide text-slate-100">
                {title}
              </h2>
              {badge && (
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>
    )}
    <div className="p-4 sm:p-6">{children}</div>
  </section>
);

/**
 * Komponen Label & Select Dropdown Reusable
 */
const StudioSelect = ({ label, icon: Icon, value, onChange, options, helperText }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-violet-200/90 flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-violet-400" />}
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#090D18] text-slate-100 text-sm rounded-xl px-3.5 py-2.5 border border-violet-500/25 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all appearance-none cursor-pointer"
      >
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val} className="bg-[#0E1424] text-slate-100">
              {lbl}
            </option>
          );
        })}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-violet-400">
        <ChevronRight className="w-4 h-4 rotate-90" />
      </div>
    </div>
    {helperText && <span className="text-[11px] text-slate-400">{helperText}</span>}
  </div>
);

/**
 * Komponen Toggle Switch Reusable untuk Fitur Intonasi & Pengaturan
 */
const StudioToggleCard = ({ title, description, active, onToggle, tag }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-start justify-between gap-3 ${
      active
        ? 'bg-gradient-to-br from-violet-950/70 to-[#151C32] border-violet-400/50 shadow-md shadow-violet-950/30'
        : 'bg-[#090D18]/80 border-violet-500/15 hover:border-violet-500/30'
    }`}
  >
    <div className="space-y-1 pr-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs sm:text-sm font-semibold text-slate-100">{title}</span>
        {tag && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-400/20 font-mono">
            {tag}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>
    <div
      className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 shrink-0 mt-0.5 flex items-center ${
        active ? 'bg-violet-500 justify-end' : 'bg-slate-800 border border-slate-700 justify-start'
      }`}
    >
      <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
    </div>
  </button>
);

// ============================================================================
// KOMPONEN UTAMA APLIKASI: MIKEYVERSE AUDIO STUDIO
// ============================================================================

export default function App() {
  // 1. State Navigasi Menu
  const [activeMenu, setActiveMenu] = useState('speech-generator');

  // 2. State A: Speaker Mode ('single' | 'dialog')
  const [speakerMode, setSpeakerMode] = useState('single');
  const [activeSpeakerTab, setActiveSpeakerTab] = useState('speaker1');

  // 3. State B: Voice Settings (Mendukung Single Speaker & Dialog 2 Speakers)
  const [speaker1Config, setSpeaker1Config] = useState({
    alias: 'Narator Utama',
    voiceModel: 'Kore',
    pace: 1.0,
    style: 'Narasi Profesional',
    emotion: 'Netral & Seimbang',
    language: 'id-ID',
    customDirection: 'Gunakan artikulasi yang jernih, tegas, dan ritme bicara yang nyaman didengar.'
  });

  const [speaker2Config, setSpeaker2Config] = useState({
    alias: 'Karakter Kedua',
    voiceModel: 'Puck',
    pace: 1.05,
    style: 'Karakter Animasi',
    emotion: 'Antusias & Ceria',
    language: 'id-ID',
    customDirection: 'Tampilkan ekspresi suara yang hangat, responsif, dan hidup saat berdialog.'
  });

  // 4. State C: Audio Reference (Upload multiple files, preview real local files, remove)
  const [referenceFiles, setReferenceFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [activeRefPreviewId, setActiveRefPreviewId] = useState(null);
  const refAudioElement = useRef(null);

  // 5. State D: AI Script Writer
  const [scriptTopic, setScriptTopic] = useState('');
  const [scriptGenre, setScriptGenre] = useState('Animasi & Storytelling');
  const [scriptDraft, setScriptDraft] = useState(
    'Selamat datang di MikeyVerse Audio Studio. Di dunia animasi modern, setiap karakter memiliki warna suara dan jiwa yang unik untuk menghidupkan cerita.'
  );

  // 6. State E: Enhance Intonation
  const [intonationConfig, setIntonationConfig] = useState({
    enhancePunctuation: true,
    naturalPauses: true,
    emotionalExpression: true,
    voiceEmphasis: false
  });

  // 7. State F: Text to Speech Input
  const [ttsText, setTtsText] = useState(
    'Selamat datang di MikeyVerse Audio Studio. Platform ini dirancang untuk menghasilkan narasi dan dialog berkualitas studio bagi kreator animasi dan pencerita.'
  );
  const MAX_CHARS = 5000;

  // 8. State G: Audio Player & My Audio History
  // Catatan Penting: Tidak menggunakan audio simulasi. Player hanya memutar blob audio asli
  // (misalnya saat file referensi dimuat ke deck untuk uji coba perangkat, atau saat backend TTS kelak mengembalikan WAV asli).
  const [loadedAudioSource, setLoadedAudioSource] = useState(null); // { url, title, isFromReference, mimeType }
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const mainAudioRef = useRef(null);

  // Daftar proyek di halaman My Audio (Menyimpan konfigurasi & payload TTS yang disiapkan)
  const [savedAudioProjects, setSavedAudioProjects] = useState([
    {
      id: 'proj-001',
      title: 'Opening Narasi MikeyVerse 2026',
      createdAt: 'Hari ini',
      speakerMode: 'single',
      voiceLabel: 'Kore (id-ID)',
      textSnippet: 'Selamat datang di MikeyVerse Audio Studio. Platform ini dirancang untuk menghasilkan narasi...',
      status: 'Menunggu Integrasi Backend API',
      audioUrl: null
    }
  ]);

  // 9. State Pengaturan Studio & Endpoint Backend
  const [studioSettings, setStudioSettings] = useState({
    backendEndpoint: 'https://mikeyverse-audio-studio.onrender.com/api/v1/mikeyverse/tts/generate',
    scriptEndpoint: '/api/v1/mikeyverse/script/generate',
    sampleRate: '24000',
    bitDepth: '16-bit PCM WAV',
    autoApplyIntonation: true
  });

  // 10. State Status Umpan Balik UI, Loading TTS & Modal Inspector Payload API
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [studioNotice, setStudioNotice] = useState(null);
  const [showPayloadModal, setShowPayloadModal] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Helper menampilkan pesan status studio (tanpa alert browser)
  const notifyStudio = (title, message, type = 'info') => {
    setStudioNotice({ title, message, type, timestamp: Date.now() });
  };

  // Bersihkan Object URL saat komponen unmount untuk mencegah kebocoran memori
  useEffect(() => {
    return () => {
      referenceFiles.forEach((f) => {
        if (f.url) URL.revokeObjectURL(f.url);
      });
    };
  }, []);

  // Sinkronisasi pengaturan Speaker yang sedang aktif diedit pada tab Voice Settings
  const currentSpeakerConfig = activeSpeakerTab === 'speaker1' ? speaker1Config : speaker2Config;
  const updateCurrentSpeakerConfig = (field, value) => {
    if (activeSpeakerTab === 'speaker1') {
      setSpeaker1Config((prev) => ({ ...prev, [field]: value }));
    } else {
      setSpeaker2Config((prev) => ({ ...prev, [field]: value }));
    }
  };

  // ============================================================================
  // ARSITEKTUR PAYLOAD GENERATOR UNTUK INTEGRASI BACKEND GEMINI TTS API
  // ============================================================================

  // Helper memformat naskah mode dialog agar setiap baris memiliki nama pembicara diikuti titik dua
  const formatDialogScriptText = (rawText, alias1, alias2) => {
    const spk1 = (alias1 || 'Speaker 1').trim();
    const spk2 = (alias2 || 'Speaker 2').trim();
    return rawText
      .split('\n')
      .map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.includes(':')) return trimmed;
        const currentAlias = idx % 2 === 0 ? spk1 : spk2;
        return `${currentAlias}: ${trimmed}`;
      })
      .filter(Boolean)
      .join('\n');
  };

  const geminiBackendPayload = useMemo(() => {
    // Membangun instruksi intonasi & arahan suara untuk Gemini 2.5 Flash TTS
    const activeIntonationRules = [];
    if (intonationConfig.enhancePunctuation) activeIntonationRules.push('Optimize punctuation breathing cadence');
    if (intonationConfig.naturalPauses) activeIntonationRules.push('Insert natural micro-pauses between clauses');
    if (intonationConfig.emotionalExpression) activeIntonationRules.push('Amplify emotional resonance naturally');
    if (intonationConfig.voiceEmphasis) activeIntonationRules.push('Apply dynamic emphasis on key operational words');

    const buildDirectorPrompt = (cfg) =>
      `Language: ${cfg.language} | Style: ${cfg.style} | Emotion: ${cfg.emotion} | Pace: ${cfg.pace}x | Intonation: [${activeIntonationRules.join(', ') || 'Standard'}] | Direction: ${cfg.customDirection}`;

    const normalizedText =
      speakerMode === 'dialog'
        ? formatDialogScriptText(ttsText, speaker1Config.alias, speaker2Config.alias)
        : ttsText.trim();

    const sharedStudioMetadata = {
      speakerMode,
      speaker1: speaker1Config,
      speaker2: speakerMode === 'dialog' ? speaker2Config : null,
      intonationEnhancements: intonationConfig,
      referenceAudioFiles: referenceFiles.map((f) => ({
        name: f.name,
        sizeBytes: f.size,
        mimeType: f.type
      })),
      outputFormat: `${studioSettings.bitDepth} @ ${studioSettings.sampleRate}Hz`,
      sampleRate: parseInt(studioSettings.sampleRate, 10) || 24000
    };

    if (speakerMode === 'single') {
      return {
        endpointTarget: studioSettings.backendEndpoint,
        text: normalizedText,
        speakerMode: 'single',
        speaker1: speaker1Config,
        speaker2: speaker2Config,
        intonationConfig,
        studioMetadata: sharedStudioMetadata,
        geminiModel: 'gemini-2.5-flash-preview-tts',
        requestBody: {
          contents: [
            {
              parts: [
                {
                  text: `[Voice Direction: ${buildDirectorPrompt(speaker1Config)}]\n\n${normalizedText}`
                }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: speaker1Config.voiceModel
                }
              }
            }
          }
        }
      };
    } else {
      return {
        endpointTarget: studioSettings.backendEndpoint,
        text: normalizedText,
        speakerMode: 'dialog',
        speaker1: speaker1Config,
        speaker2: speaker2Config,
        intonationConfig,
        studioMetadata: sharedStudioMetadata,
        geminiModel: 'gemini-2.5-flash-preview-tts',
        requestBody: {
          contents: [
            {
              parts: [
                {
                  text: `TTS the following dialog between ${speaker1Config.alias} and ${speaker2Config.alias}.\n` +
                    `${speaker1Config.alias} direction: (${buildDirectorPrompt(speaker1Config)})\n` +
                    `${speaker2Config.alias} direction: (${buildDirectorPrompt(speaker2Config)})\n\n` +
                    `${normalizedText}`
                }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                  {
                    speaker: speaker1Config.alias,
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: speaker1Config.voiceModel }
                    }
                  },
                  {
                    speaker: speaker2Config.alias,
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: speaker2Config.voiceModel }
                    }
                  }
                ]
              }
            }
          }
        }
      };
    }
  }, [
    speakerMode,
    speaker1Config,
    speaker2Config,
    intonationConfig,
    ttsText,
    referenceFiles,
    studioSettings
  ]);

  // ============================================================================
  // HANDLER INTERAKSI FITUR STUDIO
  // ============================================================================

  // Handler Mode Pembicara (Single vs Dialog)
  const handleSpeakerModeChange = (mode) => {
    setSpeakerMode(mode);
    if (mode === 'dialog' && !ttsText.includes(':')) {
      setTtsText(
        `${speaker1Config.alias}: Halo! Selamat datang di sesi rekaman MikeyVerse Audio Studio.\n` +
          `${speaker2Config.alias}: Terima kasih! Naskah dialog kita sudah siap untuk diproses.`
      );
    }
  };

  // Handler B: Voice Preview (Tanpa Audio Simulasi & Tanpa Klaim Palsu API Terhubung)
  const handleVoicePreview = (voiceId, speakerLabel = 'Speaker') => {
    notifyStudio(
      `Permintaan Voice Preview (${voiceId}) Disiapkan`,
      `Aplikasi berada dalam mode Frontend Studio (Backend Gemini TTS API belum dihubungkan). Tidak ada audio simulasi yang diputar. Konfigurasi preview untuk model suara "${voiceId}" (${speakerLabel}) telah divalidasi.`,
      'warning'
    );
  };

  // Handler C: Upload Multiple Audio Reference Files
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = [];
    const rejectedFiles = [];

    files.forEach((file) => {
      const isAudio =
        file.type.startsWith('audio/') ||
        /\.(wav|mp3|flac|ogg|m4a|aac)$/i.test(file.name);
      if (isAudio) {
        validFiles.push({
          id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'audio/wav',
          url: URL.createObjectURL(file)
        });
      } else {
        rejectedFiles.push(file.name);
      }
    });

    if (validFiles.length > 0) {
      setReferenceFiles((prev) => [...prev, ...validFiles]);
      notifyStudio(
        'File Referensi Audio Ditambahkan',
        `${validFiles.length} file audio berhasil dimuat. Anda dapat memutar pratinjau file asli Anda atau memuatnya ke Audio Player utama.`,
        'success'
      );
    }

    if (rejectedFiles.length > 0) {
      notifyStudio(
        'Format File Tidak Didukung',
        `File berikut dilewati karena bukan format audio yang didukung: ${rejectedFiles.join(', ')}`,
        'warning'
      );
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handler Hapus File Referensi Audio
  const handleRemoveReferenceFile = (id) => {
    setReferenceFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && target.url) {
        if (loadedAudioSource?.url === target.url) {
          setLoadedAudioSource(null);
          setIsPlaying(false);
        }
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((item) => item.id !== id);
    });
    if (activeRefPreviewId === id) {
      if (refAudioElement.current) {
        refAudioElement.current.pause();
      }
      setActiveRefPreviewId(null);
    }
  };

  // Handler Preview File Referensi yang Diunggah Pengguna (File Lokal Asli)
  const toggleReferencePreview = (fileObj) => {
    if (!refAudioElement.current) return;

    if (activeRefPreviewId === fileObj.id) {
      refAudioElement.current.pause();
      setActiveRefPreviewId(null);
    } else {
      refAudioElement.current.src = fileObj.url;
      refAudioElement.current.play().catch(() => {
        notifyStudio(
          'Gagal Memutar File Referensi',
          'Browser tidak dapat mendekode format file audio lokal ini.',
          'warning'
        );
      });
      setActiveRefPreviewId(fileObj.id);
    }
  };

  // Handler Muat File Referensi ke Main Audio Player Deck
  const loadReferenceToMainDeck = (fileObj) => {
    setLoadedAudioSource({
      url: fileObj.url,
      title: `[Referensi Lokal] ${fileObj.name}`,
      isFromReference: true,
      mimeType: fileObj.type
    });
    setCurrentTime(0);
    setIsPlaying(false);
    notifyStudio(
      'Dimuat ke Deck Audio Player',
      `File referensi "${fileObj.name}" dimuat ke Audio Player utama untuk pengujian pemutaran.`,
      'info'
    );
  };

  // Handler D: AI Script Writer Generation Action
  const handleGenerateScriptDraft = () => {
    const cleanTopic = scriptTopic.trim() || 'Petualangan Dunia Animasi MikeyVerse';
    if (speakerMode === 'single') {
      const structuredDraft =
        `[Topik: ${cleanTopic} | Genre: ${scriptGenre}]\n\n` +
        `Di balik setiap karya visual yang memukau, terdapat kekuatan suara yang menghidupkan imajinasi. ` +
        `Melalui ${cleanTopic}, kita diajak menyelami setiap detail cerita dengan intonasi yang jernih, ` +
        `jeda yang terukur, dan ekspresi emosi yang menyentuh pendengar.`;
      setScriptDraft(structuredDraft);
    } else {
      const structuredDialog =
        `${speaker1Config.alias}: Kita baru saja menyiapkan konsep untuk "${cleanTopic}" dengan gaya ${scriptGenre}.\n` +
        `${speaker2Config.alias}: Luar biasa! Pastikan setiap bagian memiliki penekanan intonasi dan jeda yang pas agar terdengar natural.`;
      setScriptDraft(structuredDialog);
    }

    notifyStudio(
      'Draf Naskah Studio Disiapkan',
      `Kerangka naskah lokal untuk topik "${cleanTopic}" telah dibuat di editor. Endpoint AI Script Backend (${studioSettings.scriptEndpoint}) siap dihubungkan kapan saja.`,
      'info'
    );
  };

  // Kirim Naskah dari AI Script Writer ke Editor Text-to-Speech
  const handleApplyScriptToTTS = () => {
    // Bersihkan header metadata jika ada
    const cleaned = scriptDraft.replace(/^\[Topik:.*?\]\n\n/s, '');
    setTtsText(cleaned.slice(0, MAX_CHARS));
    notifyStudio(
      'Naskah Diterapkan ke Text-to-Speech',
      'Naskah dari AI Script Writer berhasil disalin ke kolom utama Text-to-Speech.',
      'success'
    );
  };

  // Handler E: Enhance Intonation Processing pada Teks
  const handleApplyIntonationToText = () => {
    if (!ttsText.trim()) {
      notifyStudio('Teks Kosong', 'Masukkan teks terlebih dahulu sebelum menerapkan optimasi intonasi.', 'warning');
      return;
    }

    let processed = ttsText.trim();

    // 1. Enhance Punctuation: rapikan spasi berlebih & pastikan kalimat diakhiri tanda baca
    if (intonationConfig.enhancePunctuation) {
      processed = processed.replace(/\s+/g, ' ');
      if (!/[.!?]$/.test(processed)) {
        processed += '.';
      }
    }

    // 2. Natural Pauses: tambahkan penanda jeda bernapas setelah titik atau koma panjang jika belum ada
    if (intonationConfig.naturalPauses && !processed.includes('[jeda-alami]')) {
      processed = processed.replace(/\. /g, '. [jeda-alami] ');
    }

    // 3. Emotional Expression: sematkan cue emosi sesuai pengaturan speaker
    if (intonationConfig.emotionalExpression && !processed.startsWith('(')) {
      processed = `(${speaker1Config.emotion}) ${processed}`;
    }

    // 4. Voice Emphasis: tambahkan penanda fokus artikulasi di akhir
    if (intonationConfig.voiceEmphasis && !processed.includes('[penekanan-tegas]')) {
      processed = `${processed} [penekanan-tegas]`;
    }

    setTtsText(processed.slice(0, MAX_CHARS));
    notifyStudio(
      'Enhance Intonation Diterapkan',
      'Penanda intonasi dan struktur tanda baca telah dioptimalkan pada naskah Text-to-Speech serta dimasukkan ke dalam payload arahan suara.',
      'success'
    );
  };

  // Handler F: Generate Audio Button (Terhubung ke Backend MikeyVerse TTS API)
  const handleGenerateTTSAudio = async () => {
    if (isGeneratingTTS) return;

    if (!ttsText.trim()) {
      notifyStudio(
        'Teks Input Kosong',
        'Silakan ketik atau masukkan naskah pada kolom Text-to-Speech terlebih dahulu.',
        'warning'
      );
      return;
    }

    // Format percakapan untuk mode dialog agar setiap baris diawali alias pembicara diikuti titik dua
    const preparedText =
      speakerMode === 'dialog'
        ? formatDialogScriptText(ttsText, speaker1Config.alias, speaker2Config.alias)
        : ttsText.trim();

    if (speakerMode === 'dialog' && preparedText !== ttsText) {
      setTtsText(preparedText.slice(0, MAX_CHARS));
    }

    const requestPayload = {
      text: preparedText,
      speakerMode,
      speaker1: speaker1Config,
      speaker2: speaker2Config,
      intonationConfig,
      studioMetadata: {
        speakerMode,
        speaker1: speaker1Config,
        speaker2: speaker2Config,
        intonationEnhancements: intonationConfig,
        referenceAudioFiles: referenceFiles.map((f) => ({
          name: f.name,
          sizeBytes: f.size,
          mimeType: f.type
        })),
        outputFormat: `${studioSettings.bitDepth} @ ${studioSettings.sampleRate}Hz`,
        sampleRate: parseInt(studioSettings.sampleRate, 10) || 24000
      }
    };

    setIsGeneratingTTS(true);
    notifyStudio(
      'Memproses Sintesis Suara AI...',
      'Mengirim naskah dan konfigurasi suara ke server MikeyVerse Audio Studio. Mohon tunggu sebentar...',
      'info'
    );

    try {
      const endpointUrl =
        studioSettings.backendEndpoint?.trim() ||
        'https://mikeyverse-audio-studio.onrender.com/api/v1/mikeyverse/tts/generate';

      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      let result = null;
      try {
        result = await response.json();
      } catch (jsonErr) {
        throw new Error(
          `Respons server tidak dalam format JSON yang valid (HTTP ${response.status}).`
        );
      }

      if (!response.ok || !result?.success || !result?.audioBase64) {
        const backendErrorMsg =
          result?.error ||
          result?.message ||
          `Permintaan gagal diproses oleh server (HTTP ${response.status}).`;
        throw new Error(backendErrorMsg);
      }

      // Bersihkan prefix data URL jika ada dan periksa header kontainer audio
      const cleanBase64 = result.audioBase64
        .replace(/^data:audio\/[^;]+;base64,/, '')
        .replace(/\s/g, '');
      const responseMimeType = result.mimeType || 'audio/wav';
      const rateMatch = responseMimeType.match(/rate=(\d+)/i);
      const sampleRate = rateMatch
        ? parseInt(rateMatch[1], 10)
        : parseInt(studioSettings.sampleRate, 10) || 24000;

      const headerPreview = window.atob(cleanBase64.slice(0, 16));
      const hasAudioContainerHeader =
        headerPreview.startsWith('RIFF') ||
        headerPreview.startsWith('ID3') ||
        headerPreview.startsWith('OggS') ||
        headerPreview.startsWith('fLaC');

      let wavBlob;
      if (
        !hasAudioContainerHeader ||
        responseMimeType.toLowerCase().includes('pcm') ||
        responseMimeType.toLowerCase().includes('l16')
      ) {
        // Konversi raw PCM 16-bit menjadi kontainer WAV standar yang siap diputar dan diunduh
        wavBlob = convertPcm16Base64ToWavBlob(cleanBase64, sampleRate);
      } else {
        const binaryString = window.atob(cleanBase64);
        const byteLength = binaryString.length;
        const bytes = new Uint8Array(byteLength);
        for (let i = 0; i < byteLength; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        wavBlob = new Blob([bytes.buffer], {
          type: headerPreview.startsWith('RIFF') ? 'audio/wav' : responseMimeType
        });
      }

      const audioObjectUrl = URL.createObjectURL(wavBlob);
      const generatedTitle =
        scriptTopic.trim() ||
        `Sesi Studio ${
          speakerMode === 'single'
            ? speaker1Config.voiceModel
            : `${speaker1Config.voiceModel} & ${speaker2Config.voiceModel}`
        }`;

      // Muat hasil audio ke Audio Player utama
      setLoadedAudioSource({
        url: audioObjectUrl,
        title: generatedTitle,
        isFromReference: false,
        mimeType: 'audio/wav'
      });
      setCurrentTime(0);
      setIsPlaying(false);

      // Simpan proyek beserta URL audio ke daftar My Audio
      const newProject = {
        id: `proj-${Date.now().toString().slice(-4)}`,
        title: generatedTitle,
        createdAt: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        speakerMode,
        voiceLabel:
          speakerMode === 'single'
            ? `${speaker1Config.voiceModel} (${speaker1Config.language})`
            : `${speaker1Config.voiceModel} + ${speaker2Config.voiceModel}`,
        textSnippet:
          preparedText.slice(0, 120) + (preparedText.length > 120 ? '...' : ''),
        status: 'Selesai (Audio Siap Diputar)',
        payload: requestPayload,
        audioUrl: audioObjectUrl
      };

      setSavedAudioProjects((prev) => [newProject, ...prev]);

      notifyStudio(
        'Audio Berhasil Dihasilkan!',
        'Sintesis suara AI selesai. Audio telah dimuat ke Audio Player utama, siap diputar, diunduh sebagai WAV, dan tersimpan di My Audio.',
        'success'
      );
    } catch (error) {
      notifyStudio(
        'Gagal Menghasilkan Audio',
        error?.message ||
          'Tidak dapat terhubung ke server backend Text-to-Speech. Silakan periksa koneksi atau coba beberapa saat lagi.',
        'warning'
      );
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  // Handler G: Kontrol Audio Player Utama
  const handleTogglePlayMain = () => {
    if (!loadedAudioSource || !mainAudioRef.current) {
      notifyStudio(
        'Belum Ada Stream Audio Aktif',
        'Backend Gemini TTS API belum terhubung (tidak ada audio simulasi yang digunakan). Anda dapat mengunggah file pada bagian Audio Reference lalu klik "Muat ke Player" untuk menguji kontrol pemutar audio.',
        'warning'
      );
      return;
    }

    if (isPlaying) {
      mainAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      mainAudioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const handleSeekAudio = (e) => {
    if (!loadedAudioSource || !mainAudioRef.current || !duration) return;
    const newTime = parseFloat(e.target.value);
    mainAudioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDownloadWav = () => {
    if (!loadedAudioSource?.url) {
      notifyStudio(
        'Unduhan WAV Menunggu Output Backend',
        'Saat ini belum ada file WAV hasil render dari backend API. Setelah backend Gemini TTS dihubungkan, tombol ini akan mengunduh kontainer WAV PCM 24kHz.',
        'warning'
      );
      return;
    }

    const link = document.createElement('a');
    link.href = loadedAudioSource.url;
    const cleanName = loadedAudioSource.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${cleanName || 'mikeyverse_studio_audio'}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Salin JSON Payload ke Clipboard
  const handleCopyPayload = () => {
    const text = JSON.stringify(geminiBackendPayload, null, 2);
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Format Waktu (detik -> MM:SS)
  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Format Ukuran File
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // ============================================================================
  // DEFINISI MENU NAVIGASI
  // ============================================================================

  const MENU_ITEMS = [
    { id: 'speech-generator', label: 'Speech Generator', icon: Sliders, badge: 'Studio' },
    { id: 'voice-library', label: 'Voice Library', icon: Mic, badge: `${VOICE_LIBRARY_DATA.length}` },
    { id: 'ai-script-writer', label: 'AI Script Writer', icon: Sparkles },
    { id: 'enhance-intonation', label: 'Enhance Intonation', icon: Wand2 },
    { id: 'my-audio', label: 'My Audio', icon: FolderHeart, badge: `${savedAudioProjects.length}` },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // ============================================================================
  // SUB-VIEW KOMPONEN PER BAGIAN (REUSABLE DI SPEECH GENERATOR & HALAMAN MENU)
  // ============================================================================

  /**
   * Bagian A: SPEAKER MODE (Single Speaker & Dialog 2 Speakers)
   */
  const renderSpeakerModeSection = () => (
    <StudioCard
      title="A. SPEAKER MODE"
      subtitle="Pilih konfigurasi pembicara tunggal atau percakapan dua karakter"
      icon={Users}
      badge={speakerMode === 'single' ? 'Single Mode' : 'Dialog 2 Speakers'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Opsi Single Speaker */}
        <button
          type="button"
          onClick={() => handleSpeakerModeChange('single')}
          className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
            speakerMode === 'single'
              ? 'bg-gradient-to-br from-violet-900/50 via-[#19153A] to-[#0E1424] border-violet-400 shadow-lg shadow-violet-950/50'
              : 'bg-[#090D18]/70 border-violet-500/15 hover:border-violet-500/35'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              speakerMode === 'single'
                ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30'
                : 'bg-slate-800/80 text-slate-400'
            }`}
          >
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm text-slate-100">Single Speaker</span>
              {speakerMode === 'single' && (
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-sm shadow-violet-300" />
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Fokus pada satu suara narator atau karakter utama untuk monolog, voiceover, dan cerita.
            </p>
          </div>
        </button>

        {/* Opsi Dialog (2 Speakers) */}
        <button
          type="button"
          onClick={() => handleSpeakerModeChange('dialog')}
          className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
            speakerMode === 'dialog'
              ? 'bg-gradient-to-br from-violet-900/50 via-[#19153A] to-[#0E1424] border-violet-400 shadow-lg shadow-violet-950/50'
              : 'bg-[#090D18]/70 border-violet-500/15 hover:border-violet-500/35'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              speakerMode === 'dialog'
                ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30'
                : 'bg-slate-800/80 text-slate-400'
            }`}
          >
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm text-slate-100">Dialog (2 Speakers)</span>
              {speakerMode === 'dialog' && (
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-sm shadow-violet-300" />
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Percakapan interaktif antara 2 karakter berbeda menggunakan konfigurasi Multi-Speaker.
            </p>
          </div>
        </button>
      </div>

      {/* Pengaturan Nama Karakter Saat Mode Dialog Aktif */}
      {speakerMode === 'dialog' && (
        <div className="mt-4 pt-4 border-t border-violet-500/15 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#090D18]/90 p-3 rounded-xl border border-violet-500/20">
            <label className="text-[11px] font-medium text-violet-300 block mb-1">
              Label Pembicara 1 (Speaker 1)
            </label>
            <input
              type="text"
              value={speaker1Config.alias}
              onChange={(e) => setSpeaker1Config((p) => ({ ...p, alias: e.target.value }))}
              placeholder="Contoh: Narator / Mikey"
              className="w-full bg-[#0E1424] text-slate-100 text-xs sm:text-sm px-3 py-2 rounded-lg border border-violet-500/25 focus:border-violet-400 focus:outline-none"
            />
          </div>
          <div className="bg-[#090D18]/90 p-3 rounded-xl border border-violet-500/20">
            <label className="text-[11px] font-medium text-violet-300 block mb-1">
              Label Pembicara 2 (Speaker 2)
            </label>
            <input
              type="text"
              value={speaker2Config.alias}
              onChange={(e) => setSpeaker2Config((p) => ({ ...p, alias: e.target.value }))}
              placeholder="Contoh: Karakter 2 / Lyra"
              className="w-full bg-[#0E1424] text-slate-100 text-xs sm:text-sm px-3 py-2 rounded-lg border border-violet-500/25 focus:border-violet-400 focus:outline-none"
            />
          </div>
        </div>
      )}
    </StudioCard>
  );

  /**
   * Bagian B: VOICE SETTINGS
   */
  const renderVoiceSettingsSection = () => {
    const selectedVoiceDetail =
      VOICE_LIBRARY_DATA.find((v) => v.id === currentSpeakerConfig.voiceModel) ||
      VOICE_LIBRARY_DATA[0];

    return (
      <StudioCard
        title="B. VOICE SETTINGS"
        subtitle="Atur model suara, kecepatan bicara, gaya, emosi, bahasa, dan arahan khusus"
        icon={Sliders}
        badge={speakerMode === 'dialog' ? `Mengatur: ${currentSpeakerConfig.alias}` : selectedVoiceDetail.name}
        headerAction={
          speakerMode === 'dialog' && (
            <div className="inline-flex p-1 rounded-xl bg-[#090D18] border border-violet-500/25">
              <button
                type="button"
                onClick={() => setActiveSpeakerTab('speaker1')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeSpeakerTab === 'speaker1'
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1: {speaker1Config.alias}
              </button>
              <button
                type="button"
                onClick={() => setActiveSpeakerTab('speaker2')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeSpeakerTab === 'speaker2'
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2: {speaker2Config.alias}
              </button>
            </div>
          )
        }
      >
        <div className="space-y-5">
          {/* Baris 1: Voice Model Selection & Voice Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between bg-[#090D18]/80 p-4 rounded-xl border border-violet-500/20">
              <StudioSelect
                label="Voice Model Selection"
                icon={Mic}
                value={currentSpeakerConfig.voiceModel}
                onChange={(val) => updateCurrentSpeakerConfig('voiceModel', val)}
                options={VOICE_LIBRARY_DATA.map((v) => ({
                  value: v.id,
                  label: `${v.name} — ${v.characteristic} (${v.badge})`
                }))}
              />
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                {selectedVoiceDetail.description}
              </p>
            </div>

            {/* Kartu Voice Preview */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#161233] to-[#0B1020] p-4 rounded-xl border border-violet-500/25 flex flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-violet-300 font-semibold">
                    Voice Preview
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    Model: {selectedVoiceDetail.name}
                  </h3>
                  <span className="text-xs text-violet-200/80">{selectedVoiceDetail.characteristic}</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] rounded-md bg-violet-500/20 text-violet-200 border border-violet-400/30">
                  {selectedVoiceDetail.badge}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleVoicePreview(selectedVoiceDetail.id, currentSpeakerConfig.alias)}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-violet-600/25 hover:bg-violet-600/40 border border-violet-400/40 text-violet-100 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Volume2 className="w-4 h-4 text-violet-300" />
                Voice Preview ({selectedVoiceDetail.name})
              </button>
            </div>
          </div>

          {/* Baris 2: Language, Voice Style, Emotion */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StudioSelect
              label="Language (Bahasa)"
              icon={Globe}
              value={currentSpeakerConfig.language}
              onChange={(val) => updateCurrentSpeakerConfig('language', val)}
              options={SUPPORTED_LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
            />

            <StudioSelect
              label="Voice Style (Gaya Bicara)"
              icon={Radio}
              value={currentSpeakerConfig.style}
              onChange={(val) => updateCurrentSpeakerConfig('style', val)}
              options={VOICE_STYLES}
            />

            <StudioSelect
              label="Emotion (Ekspresi Emosi)"
              icon={Smile}
              value={currentSpeakerConfig.emotion}
              onChange={(val) => updateCurrentSpeakerConfig('emotion', val)}
              options={VOICE_EMOTIONS}
            />
          </div>

          {/* Baris 3: Pace (Kecepatan Bicara) */}
          <div className="bg-[#090D18]/80 p-4 rounded-xl border border-violet-500/20">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="text-xs font-medium text-violet-200 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-violet-400" />
                Pace (Kecepatan Tempo Bicara)
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { label: 'Lambat (0.8x)', val: 0.8 },
                  { label: 'Natural (1.0x)', val: 1.0 },
                  { label: 'Cepat (1.25x)', val: 1.25 }
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => updateCurrentSpeakerConfig('pace', preset.val)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      currentSpeakerConfig.pace === preset.val
                        ? 'bg-violet-600 text-white'
                        : 'bg-[#131B2E] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <span className="ml-1 px-2.5 py-0.5 rounded-lg bg-violet-500/20 border border-violet-400/30 text-violet-200 font-mono text-xs font-semibold">
                  {currentSpeakerConfig.pace.toFixed(2)}x
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={currentSpeakerConfig.pace}
              onChange={(e) => updateCurrentSpeakerConfig('pace', parseFloat(e.target.value))}
              className="w-full accent-violet-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0.50x (Sangat Lambat)</span>
              <span>1.00x (Normal Studio)</span>
              <span>1.50x (Dinamis)</span>
              <span>2.00x (Cepat)</span>
            </div>
          </div>

          {/* Baris 4: Custom Voice Direction */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-violet-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                Custom Voice Direction (Arahan Sutradara Suara)
              </span>
              <span className="text-[11px] text-slate-400">Natural Language Prompt</span>
            </label>
            <textarea
              rows={2}
              value={currentSpeakerConfig.customDirection}
              onChange={(e) => updateCurrentSpeakerConfig('customDirection', e.target.value)}
              placeholder="Contoh: Bicara dengan intonasi hangat seperti pencerita film animasi, beri penekanan lembut di akhir kalimat..."
              className="w-full bg-[#090D18] text-slate-100 text-xs sm:text-sm rounded-xl p-3 border border-violet-500/25 focus:border-violet-400 focus:outline-none resize-y"
            />
          </div>
        </div>
      </StudioCard>
    );
  };

  /**
   * Bagian C: AUDIO REFERENCE
   */
  const renderAudioReferenceSection = () => (
    <StudioCard
      title="C. AUDIO REFERENCE"
      subtitle="Unggah dan kelola beberapa file referensi audio untuk acuan karakter atau pengujian player"
      icon={FileAudio}
      badge={`${referenceFiles.length} File`}
    >
      {/* Elemen Audio Tersembunyi untuk Pratinjau File Lokal yang Diunggah */}
      <audio
        ref={refAudioElement}
        onEnded={() => setActiveRefPreviewId(null)}
        className="hidden"
      />

      <div className="space-y-4">
        {/* Area Dropzone / Tombol Upload Multiple Files */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-violet-500/30 hover:border-violet-400/60 bg-[#090D18]/60 hover:bg-[#11172B]/80 rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.wav,.mp3,.flac,.ogg,.m4a,.aac"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-violet-950/90 border border-violet-400/30 flex items-center justify-center mx-auto text-violet-300 group-hover:scale-105 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-100 mt-3">
            Klik untuk Mengunggah File Audio Referensi (Multiple Files)
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Anda dapat memilih beberapa file audio sekaligus dari perangkat Anda
          </p>
        </div>

        {/* Informasi Format File yang Didukung */}
        <div className="bg-[#090D18]/90 rounded-xl p-3.5 border border-violet-500/15">
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-300 mb-2">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Informasi Format File Audio yang Didukung:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {SUPPORTED_AUDIO_FORMATS.map((fmt) => (
              <div
                key={fmt.ext}
                className="bg-[#11182B] border border-violet-500/15 rounded-lg p-2 text-center"
              >
                <span className="text-xs font-bold text-violet-200 block">{fmt.ext}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">{fmt.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daftar File yang Diunggah (Preview & Remove) */}
        {referenceFiles.length > 0 ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                Daftar File Referensi Terunggah ({referenceFiles.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  referenceFiles.forEach((f) => f.url && URL.revokeObjectURL(f.url));
                  setReferenceFiles([]);
                  setActiveRefPreviewId(null);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Semua
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {referenceFiles.map((fileObj) => {
                const isPreviewing = activeRefPreviewId === fileObj.id;
                return (
                  <div
                    key={fileObj.id}
                    className="bg-[#090D18] border border-violet-500/25 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleReferencePreview(fileObj)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          isPreviewing
                            ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30'
                            : 'bg-violet-950/80 text-violet-300 hover:bg-violet-900'
                        }`}
                        title={isPreviewing ? 'Hentikan Pratinjau' : 'Putar Pratinjau File'}
                      >
                        {isPreviewing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-100 truncate">
                          {fileObj.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{formatFileSize(fileObj.size)}</span>
                          <span>•</span>
                          <span className="font-mono">{fileObj.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => loadReferenceToMainDeck(fileObj)}
                        className="px-2.5 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/30 text-violet-200 border border-violet-400/25 text-xs font-medium transition-all"
                      >
                        Muat ke Player
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveReferenceFile(fileObj.id)}
                        className="p-2 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-500/25 transition-all"
                        title="Hapus File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-3 text-xs text-slate-500">
            Belum ada file referensi audio yang diunggah.
          </div>
        )}
      </div>
    </StudioCard>
  );

  /**
   * Bagian D: AI SCRIPT WRITER
   */
  const renderAIScriptWriterSection = () => (
    <StudioCard
      title="D. AI SCRIPT WRITER"
      subtitle="Susun topik, buat kerangka naskah, dan sunting langsung sebelum dikirim ke Text-to-Speech"
      icon={Sparkles}
      badge="Script Studio"
    >
      <div className="space-y-4">
        {/* Baris Input Topik & Kategori */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-violet-200">
              Topic Input (Topik atau Ide Cerita)
            </label>
            <input
              type="text"
              value={scriptTopic}
              onChange={(e) => setScriptTopic(e.target.value)}
              placeholder="Contoh: Petualangan Robot Kecil Mencari Cahaya Bintang..."
              className="w-full bg-[#090D18] text-slate-100 text-sm rounded-xl px-3.5 py-2.5 border border-violet-500/25 focus:border-violet-400 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-5">
            <StudioSelect
              label="Gaya Naskah"
              value={scriptGenre}
              onChange={setScriptGenre}
              options={[
                'Animasi & Storytelling',
                'Narasi Dokumenter',
                'Iklan Produk & Promo',
                'Edukasi & Tutorial',
                'Podcast Pembuka'
              ]}
            />
          </div>
        </div>

        {/* Tombol Script Generation */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleGenerateScriptDraft}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md shadow-violet-950/50 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Generate Script Draft
          </button>

          {speakerMode === 'dialog' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setScriptDraft((prev) => `${prev}\n${speaker1Config.alias}: `)
                }
                className="px-2.5 py-1.5 rounded-lg bg-[#090D18] border border-violet-500/25 text-violet-300 text-xs hover:border-violet-400"
              >
                + Baris {speaker1Config.alias}
              </button>
              <button
                type="button"
                onClick={() =>
                  setScriptDraft((prev) => `${prev}\n${speaker2Config.alias}: `)
                }
                className="px-2.5 py-1.5 rounded-lg bg-[#090D18] border border-violet-500/25 text-violet-300 text-xs hover:border-violet-400"
              >
                + Baris {speaker2Config.alias}
              </button>
            </div>
          )}
        </div>

        {/* Script Editing Textarea */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-violet-200">
              Script Editing (Editor Naskah)
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {scriptDraft.length} karakter
            </span>
          </div>
          <textarea
            rows={4}
            value={scriptDraft}
            onChange={(e) => setScriptDraft(e.target.value)}
            placeholder="Tulis atau sunting hasil naskah di sini..."
            className="w-full bg-[#090D18] text-slate-100 text-xs sm:text-sm rounded-xl p-3.5 border border-violet-500/25 focus:border-violet-400 focus:outline-none leading-relaxed resize-y"
          />
        </div>

        {/* Tombol Kirim ke Text-to-Speech */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleApplyScriptToTTS}
            className="px-4 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-400/40 text-violet-100 text-xs sm:text-sm font-medium flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4 text-violet-300" />
            Gunakan Naskah di Text-to-Speech
          </button>
        </div>
      </div>
    </StudioCard>
  );

  /**
   * Bagian E: ENHANCE INTONATION
   */
  const renderEnhanceIntonationSection = () => (
    <StudioCard
      title="E. ENHANCE INTONATION"
      subtitle="Penyempurnaan tanda baca, jeda alami, ekspresi emosional, dan penekanan kata"
      icon={Wand2}
      badge={`${Object.values(intonationConfig).filter(Boolean).length}/4 Aktif`}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StudioToggleCard
            title="Enhance Punctuation"
            tag="Cadence"
            description="Menyelaraskan tanda titik, koma, dan tanda tanya untuk mengatur ritme napas narator secara presisi."
            active={intonationConfig.enhancePunctuation}
            onToggle={() =>
              setIntonationConfig((p) => ({ ...p, enhancePunctuation: !p.enhancePunctuation }))
            }
          />

          <StudioToggleCard
            title="Natural Pauses"
            tag="[jeda-alami]"
            description="Menyisipkan jeda mikro alami antar kalimat agar transisi terdengar manusiawi dan tidak terburu-buru."
            active={intonationConfig.naturalPauses}
            onToggle={() =>
              setIntonationConfig((p) => ({ ...p, naturalPauses: !p.naturalPauses }))
            }
          />

          <StudioToggleCard
            title="Emotional Expression"
            tag="Dynamic Tone"
            description="Menguatkan dinamika warna emosi pada suara berdasarkan parameter Emotion yang dipilih."
            active={intonationConfig.emotionalExpression}
            onToggle={() =>
              setIntonationConfig((p) => ({ ...p, emotionalExpression: !p.emotionalExpression }))
            }
          />

          <StudioToggleCard
            title="Voice Emphasis"
            tag="[penekanan-tegas]"
            description="Memberikan aksentuasi dan artikulasi ekstra pada frasa penting di dalam kalimat."
            active={intonationConfig.voiceEmphasis}
            onToggle={() =>
              setIntonationConfig((p) => ({ ...p, voiceEmphasis: !p.voiceEmphasis }))
            }
          />
        </div>

        {/* Baris Aksi Cepat Penanda Intonasi */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-violet-500/15">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1">Sisipkan Tag Cepat:</span>
            {['[jeda-pendek]', '[jeda-alami]', '[antusias]', '[bisik-halus]', '[penekanan-tegas]'].map(
              (cue) => (
                <button
                  key={cue}
                  type="button"
                  onClick={() =>
                    setTtsText((prev) => `${prev.trim()} ${cue} `.slice(0, MAX_CHARS))
                  }
                  className="px-2 py-1 rounded-lg bg-[#090D18] hover:bg-violet-950/70 border border-violet-500/20 text-[11px] font-mono text-violet-300 transition-colors"
                >
                  + {cue}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={handleApplyIntonationToText}
            className="px-3.5 py-2 rounded-xl bg-violet-600/25 hover:bg-violet-600/40 border border-violet-400/40 text-violet-100 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Wand2 className="w-3.5 h-3.5 text-violet-300" />
            Terapkan Optimasi Intonasi ke Teks
          </button>
        </div>
      </div>
    </StudioCard>
  );

  /**
   * Bagian F: TEXT TO SPEECH
   */
  const renderTextToSpeechSection = () => {
    const charCount = ttsText.length;
    const wordCount = ttsText.trim() ? ttsText.trim().split(/\s+/).length : 0;
    const estimatedSeconds = Math.max(
      1,
      Math.round((wordCount / 2.4) / (speaker1Config.pace || 1))
    );

    return (
      <StudioCard
        title="F. TEXT TO SPEECH"
        subtitle="Editor naskah final untuk proses sintesis suara AI MikeyVerse Studio"
        icon={FileText}
        badge={`${charCount} / ${MAX_CHARS} Karakter`}
      >
        <div className="space-y-4">
          {/* Toolbar Kecil di Atas Text Input */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                Mode: <strong className="text-violet-300">{speakerMode === 'single' ? 'Single Speaker' : 'Dialog 2 Speakers'}</strong>
              </span>
              <span>•</span>
              <span>
                Estimasi Durasi: <strong className="text-violet-300">~{estimatedSeconds} detik</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setTtsText('')}
              className="text-xs text-slate-400 hover:text-rose-300 transition-colors"
            >
              Bersihkan Teks
            </button>
          </div>

          {/* Text Input Area */}
          <textarea
            rows={6}
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value.slice(0, MAX_CHARS))}
            placeholder={
              speakerMode === 'single'
                ? 'Ketik atau tempel naskah yang ingin diubah menjadi suara di sini...'
                : `${speaker1Config.alias}: Ketik dialog pembicara pertama...\n${speaker2Config.alias}: Ketik balasan pembicara kedua...`
            }
            className="w-full bg-[#070B14] text-slate-100 text-sm sm:text-base rounded-2xl p-4 border border-violet-500/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 focus:outline-none leading-relaxed resize-y font-sans"
          />

          {/* Baris Bawah: Character Counter & Generate Audio Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            {/* Character Counter Bar */}
            <div className="space-y-1.5 flex-1 max-w-md">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Character Counter</span>
                <span className="font-mono text-violet-300 font-semibold">
                  {charCount} / {MAX_CHARS} ({wordCount} kata)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#090D18] overflow-hidden border border-violet-500/20">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-purple-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (charCount / MAX_CHARS) * 100)}%` }}
                />
              </div>
            </div>

            {/* Tombol Generate Audio & Inspect Payload */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowPayloadModal(true)}
                className="px-3.5 py-3 rounded-xl bg-[#090D18] hover:bg-[#131B2E] border border-violet-500/30 text-violet-200 text-xs sm:text-sm font-medium flex items-center gap-2 transition-all"
              >
                <Code2 className="w-4 h-4 text-violet-400" />
                Payload API
              </button>

              <button
                type="button"
                onClick={handleGenerateTTSAudio}
                disabled={isGeneratingTTS}
                className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-violet-900/50 border border-violet-400/30 transition-all active:scale-[0.99] ${
                  isGeneratingTTS ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isGeneratingTTS ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating Audio...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    Generate Audio
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </StudioCard>
    );
  };

  /**
   * Bagian G: AUDIO PLAYER
   */
  const renderAudioPlayerSection = () => (
    <StudioCard
      title="G. AUDIO PLAYER"
      subtitle="Master Deck Pemutar Audio Studio & Ekspor WAV"
      icon={Headphones}
      badge={loadedAudioSource ? 'Audio Terkunci di Deck' : 'Menunggu Output Backend'}
    >
      {/* Elemen HTML5 Audio Asli (Hanya aktif jika ada sumber blob audio nyata) */}
      <audio
        ref={mainAudioRef}
        src={loadedAudioSource?.url || undefined}
        onTimeUpdate={() => {
          if (mainAudioRef.current) setCurrentTime(mainAudioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (mainAudioRef.current) setDuration(mainAudioRef.current.duration || 0);
        }}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      <div className="bg-gradient-to-r from-[#090D18] via-[#12132C] to-[#090D18] border border-violet-500/25 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Info Track & Status Jujur Integrasi */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-violet-950/90 border border-violet-400/30 flex items-center justify-center text-violet-300 shrink-0">
              <Music className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                {loadedAudioSource
                  ? loadedAudioSource.title
                  : 'Belum Ada Stream Audio Aktif (Tanpa Audio Simulasi)'}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {loadedAudioSource
                  ? 'Sumber: File Audio Lokal / Siap Diputar & Diunduh'
                  : `Target Output: ${studioSettings.bitDepth} (${studioSettings.sampleRate}Hz) melalui Backend Gemini TTS API`}
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-violet-500/15 text-violet-300 border border-violet-400/25">
            {speakerMode === 'single'
              ? `Voice: ${speaker1Config.voiceModel}`
              : `Dialog: ${speaker1Config.voiceModel} & ${speaker2Config.voiceModel}`}
          </span>
        </div>

        {/* Kontrol Play, Pause, Progress Bar, dan Download WAV */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Tombol Play & Pause Eksplisit */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (!isPlaying) handleTogglePlayMain();
              }}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                !isPlaying && loadedAudioSource
                  ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-950'
                  : 'bg-[#141C33] hover:bg-[#1B2542] text-slate-200 border border-violet-500/25'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              Play
            </button>

            <button
              type="button"
              onClick={() => {
                if (isPlaying) handleTogglePlayMain();
              }}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                  : 'bg-[#141C33] hover:bg-[#1B2542] text-slate-300 border border-violet-500/25'
              }`}
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          </div>

          {/* Progress Bar Interaktif */}
          <div className="flex-1 flex flex-col gap-1.5 justify-center">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeekAudio}
              disabled={!loadedAudioSource}
              className="w-full accent-violet-400 h-2 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-50"
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>Progress Bar</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Tombol Download WAV */}
          <button
            type="button"
            onClick={handleDownloadWav}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/35 border border-violet-400/40 text-violet-100 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shrink-0 transition-all"
          >
            <Download className="w-4 h-4 text-violet-300" />
            Download WAV
          </button>
        </div>
      </div>
    </StudioCard>
  );

  // ============================================================================
  // RENDER HALAMAN BERDASARKAN MENU NAVIGASI AKTIF
  // ============================================================================

  const renderActivePageContent = () => {
    switch (activeMenu) {
      case 'speech-generator':
        return (
          <div className="space-y-6">
            {/* Quick Jump Pills untuk Kemudahan Navigasi di Smartphone */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'sec-a', label: 'A. Speaker Mode' },
                { id: 'sec-b', label: 'B. Voice Settings' },
                { id: 'sec-c', label: 'C. Audio Reference' },
                { id: 'sec-d', label: 'D. AI Script Writer' },
                { id: 'sec-e', label: 'E. Enhance Intonation' },
                { id: 'sec-f', label: 'F. Text to Speech' },
                { id: 'sec-g', label: 'G. Audio Player' }
              ].map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="px-3 py-1.5 rounded-full bg-[#0E1424] hover:bg-violet-950/80 border border-violet-500/25 text-xs font-medium text-violet-200 whitespace-nowrap transition-colors"
                >
                  {sec.label}
                </a>
              ))}
            </div>

            <div id="sec-a">{renderSpeakerModeSection()}</div>
            <div id="sec-b">{renderVoiceSettingsSection()}</div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div id="sec-c">{renderAudioReferenceSection()}</div>
              <div id="sec-d">{renderAIScriptWriterSection()}</div>
            </div>

            <div id="sec-e">{renderEnhanceIntonationSection()}</div>
            <div id="sec-f">{renderTextToSpeechSection()}</div>
            <div id="sec-g">{renderAudioPlayerSection()}</div>
          </div>
        );

      case 'voice-library':
        return (
          <div className="space-y-6">
            <StudioCard
              title="KATALOG VOICE LIBRARY MIKEYVERSE"
              subtitle="Koleksi model karakter suara yang siap digunakan pada Single Speaker maupun Dialog 2 Speakers"
              icon={Mic}
              badge={`${VOICE_LIBRARY_DATA.length} Model Suara`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {VOICE_LIBRARY_DATA.map((voice) => {
                  const isSelectedSpk1 = speaker1Config.voiceModel === voice.id;
                  const isSelectedSpk2 = speaker2Config.voiceModel === voice.id;
                  return (
                    <div
                      key={voice.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                        isSelectedSpk1 || isSelectedSpk2
                          ? 'bg-gradient-to-br from-violet-950/70 via-[#151B33] to-[#0B1020] border-violet-400/60 shadow-lg'
                          : 'bg-[#090D18]/90 border-violet-500/20 hover:border-violet-400/40'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-300 font-bold">
                              {voice.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-white">{voice.name}</h3>
                              <p className="text-xs text-violet-300">{voice.characteristic}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-violet-500/20 text-violet-200 border border-violet-400/30">
                            {voice.badge}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300/90 leading-relaxed">
                          {voice.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {voice.languages.map((lang) => (
                            <span
                              key={lang}
                              className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#141C33] text-slate-300 border border-violet-500/15"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-violet-500/15 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleVoicePreview(voice.id, 'Voice Library')}
                          className="px-3 py-2 rounded-xl bg-[#141C33] hover:bg-violet-950 text-violet-200 border border-violet-500/25 text-xs font-medium flex items-center gap-1.5"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          Preview
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSpeaker1Config((p) => ({
                              ...p,
                              voiceModel: voice.id,
                              style: voice.defaultStyle
                            }));
                            notifyStudio(
                              'Model Suara Dipilih',
                              `${voice.name} ditetapkan untuk ${speaker1Config.alias}.`,
                              'success'
                            );
                          }}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                            isSelectedSpk1
                              ? 'bg-violet-600 text-white'
                              : 'bg-violet-500/15 hover:bg-violet-500/30 text-violet-200 border border-violet-400/30'
                          }`}
                        >
                          {isSelectedSpk1 ? '✓ Aktif (Speaker 1)' : 'Pilih Speaker 1'}
                        </button>

                        {speakerMode === 'dialog' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSpeaker2Config((p) => ({
                                ...p,
                                voiceModel: voice.id,
                                style: voice.defaultStyle
                              }));
                              notifyStudio(
                                'Model Suara Speaker 2 Dipilih',
                                `${voice.name} ditetapkan untuk ${speaker2Config.alias}.`,
                                'success'
                              );
                            }}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                              isSelectedSpk2
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-500/15 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30'
                            }`}
                          >
                            {isSelectedSpk2 ? '✓ Speaker 2' : 'Speaker 2'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </StudioCard>
          </div>
        );

      case 'ai-script-writer':
        return (
          <div className="space-y-6">
            {renderAIScriptWriterSection()}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  handleApplyScriptToTTS();
                  setActiveMenu('speech-generator');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg"
              >
                Buka di Halaman Speech Generator
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'enhance-intonation':
        return (
          <div className="space-y-6">
            {renderEnhanceIntonationSection()}
            {renderTextToSpeechSection()}
          </div>
        );

      case 'my-audio':
        return (
          <div className="space-y-6">
            <StudioCard
              title="MY AUDIO & RIWAYAT PROYEK STUDIO"
              subtitle="Daftar sesi konfigurasi suara yang disiapkan beserta file referensi audio Anda"
              icon={FolderHeart}
              badge={`${savedAudioProjects.length} Item`}
            >
              <div className="space-y-4">
                {savedAudioProjects.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#090D18] border border-violet-500/25 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">{item.title}</span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30">
                          {item.voiceLabel}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">{item.textSnippet}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Dibuat: {item.createdAt}</span>
                        <span>•</span>
                        <span>Mode: {item.speakerMode === 'single' ? 'Single Speaker' : 'Dialog 2 Speakers'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.audioUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setLoadedAudioSource({
                              url: item.audioUrl,
                              title: item.title,
                              isFromReference: false,
                              mimeType: 'audio/wav'
                            });
                            setCurrentTime(0);
                            setIsPlaying(false);
                            setActiveMenu('speech-generator');
                            notifyStudio(
                              'Audio Dimuat ke Player',
                              `Proyek "${item.title}" berhasil dimuat ke Audio Player utama.`,
                              'info'
                            );
                          }}
                          className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Putar di Player
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPayloadModal(true)}
                        className="px-3 py-2 rounded-xl bg-violet-500/15 hover:bg-violet-500/30 text-violet-200 border border-violet-400/30 text-xs font-medium flex items-center gap-1.5"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        Lihat Payload
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSavedAudioProjects((prev) => prev.filter((p) => p.id !== item.id))
                        }
                        className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-500/25"
                        title="Hapus Proyek"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </StudioCard>

            {renderAudioReferenceSection()}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <StudioCard
              title="PENGATURAN STUDIO & ARSITEKTUR BACKEND GEMINI TTS"
              subtitle="Konfigurasi endpoint backend yang aman dan spesifikasi output audio"
              icon={Settings}
              badge="Backend Integration Ready"
            >
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-400/30 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-violet-300 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
                    <p className="font-semibold text-white">
                      Status Integrasi: Frontend Siap (Backend Belum Terhubung)
                    </p>
                    <p>
                      Sesuai standar keamanan produksi MikeyVerse Animation, API Key Gemini disimpan secara eksklusif di sisi server (Backend). Aplikasi frontend ini mengirimkan payload terstruktur ke endpoint di bawah ini dan tidak menggunakan audio simulasi.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-violet-200">
                      Endpoint Backend TTS (POST)
                    </label>
                    <input
                      type="text"
                      value={studioSettings.backendEndpoint}
                      onChange={(e) =>
                        setStudioSettings((p) => ({ ...p, backendEndpoint: e.target.value }))
                      }
                      className="bg-[#090D18] text-slate-100 text-xs sm:text-sm font-mono rounded-xl px-3.5 py-2.5 border border-violet-500/25 focus:border-violet-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-violet-200">
                      Endpoint Backend AI Script Writer (POST)
                    </label>
                    <input
                      type="text"
                      value={studioSettings.scriptEndpoint}
                      onChange={(e) =>
                        setStudioSettings((p) => ({ ...p, scriptEndpoint: e.target.value }))
                      }
                      className="bg-[#090D18] text-slate-100 text-xs sm:text-sm font-mono rounded-xl px-3.5 py-2.5 border border-violet-500/25 focus:border-violet-400 focus:outline-none"
                    />
                  </div>

                  <StudioSelect
                    label="Target Sample Rate Audio"
                    value={studioSettings.sampleRate}
                    onChange={(val) => setStudioSettings((p) => ({ ...p, sampleRate: val }))}
                    options={[
                      { value: '24000', label: '24,000 Hz (Standar Native Gemini TTS)' },
                      { value: '44100', label: '44,100 Hz (Broadcast CD Quality)' },
                      { value: '48000', label: '48,000 Hz (Studio Animation Master)' }
                    ]}
                  />

                  <StudioSelect
                    label="Format Kontainer Output"
                    value={studioSettings.bitDepth}
                    onChange={(val) => setStudioSettings((p) => ({ ...p, bitDepth: val }))}
                    options={['16-bit PCM WAV', '24-bit Studio WAV']}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPayloadModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2"
                  >
                    <Terminal className="w-4 h-4" />
                    Inspeksi Payload JSON Backend Sekarang
                  </button>
                </div>
              </div>
            </StudioCard>
          </div>
        );

      default:
        return null;
    }
  };

  // ============================================================================
  // RENDER UTAMA LAYOUT STUDIO (MOBILE-FIRST & DESKTOP WORKSTATION)
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-violet-500 selection:text-white">
      {/* Latar Belakang Dekoratif Cahaya Studio (Navy, Deep Purple, Soft Violet) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-900/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-violet-800/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-indigo-950/25 blur-3xl" />
      </div>

      {/* HEADER UTAMA STUDIO */}
      <header className="sticky top-0 z-30 bg-[#090D18]/90 backdrop-blur-xl border-b border-violet-500/20 px-4 lg:px-8 py-3.5">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
          {/* Identitas Brand MikeyVerse Audio Studio */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-900 p-0.5 shadow-lg shadow-violet-900/40 shrink-0">
              <div className="w-full h-full bg-[#090D18] rounded-[14px] flex items-center justify-center">
                <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-violet-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-lg font-extrabold tracking-wider bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent">
                  MIKEYVERSE AUDIO STUDIO
                </h1>
                <span className="hidden md:inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest rounded-md bg-violet-500/20 text-violet-300 border border-violet-400/30">
                  Free Platform
                </span>
              </div>
              <p className="text-xs text-violet-300/80 font-medium">AI Speech Generator</p>
            </div>
          </div>

          {/* Indikator Transparan Status Backend & Inspector Payload */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowPayloadModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#12182B] hover:bg-[#19213A] border border-violet-500/30 flex items-center gap-2 text-xs transition-all"
              title="Klik untuk melihat kesiapan struktur integrasi Gemini TTS API"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="hidden sm:inline text-slate-300 font-medium">
                API Backend: Siap Integrasi
              </span>
              <span className="sm:hidden text-slate-300 font-medium">API Spec</span>
              <Code2 className="w-3.5 h-3.5 text-violet-300" />
            </button>
          </div>
        </div>
      </header>

      {/* BODY UTAMA: SIDEBAR DESKTOP + WORKSPACE */}
      <div className="relative z-10 flex-1 max-w-[1440px] w-full mx-auto flex flex-col lg:flex-row gap-6 px-4 lg:px-8 pt-5 pb-28 lg:pb-12">
        {/* SIDEBAR NAVIGASI (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0">
          <div className="sticky top-24 bg-[#0E1424]/90 border border-violet-500/20 rounded-2xl p-3.5 shadow-xl space-y-6">
            <div className="space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-300/70">
                Studio Navigation
              </p>
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-600/90 to-purple-700/90 text-white shadow-md shadow-violet-950/60 border border-violet-400/40'
                        : 'text-slate-300 hover:bg-[#151D33] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-violet-400'}`} />
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-violet-500/15 text-violet-300 border border-violet-400/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Ringkasan Konfigurasi Saat Ini di Sidebar */}
            <div className="p-3.5 rounded-xl bg-[#090D18] border border-violet-500/20 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Mode Aktif</span>
                <span className="font-semibold text-violet-300 capitalize">{speakerMode}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Suara Utama</span>
                <span className="font-semibold text-slate-200">{speaker1Config.voiceModel}</span>
              </div>
              {speakerMode === 'dialog' && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Suara Kedua</span>
                  <span className="font-semibold text-slate-200">{speaker2Config.voiceModel}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tempo (Pace)</span>
                <span className="font-mono text-violet-300">{speaker1Config.pace}x</span>
              </div>
            </div>
          </div>
        </aside>

        {/* NAVIGASI HORIZONTAL TABLET/MOBILE (Di atas konten agar mudah dijangkau selain Bottom Nav) */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveMenu(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md border border-violet-400/40'
                    : 'bg-[#0E1424] text-slate-300 border border-violet-500/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* AREA WORKSPACE UTAMA */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Banner Notifikasi Interaktif Studio (Pengganti alert browser) */}
          {studioNotice && (
            <div
              className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-lg transition-all ${
                studioNotice.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-100'
                  : studioNotice.type === 'warning'
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-100'
                  : 'bg-violet-950/70 border-violet-400/40 text-violet-100'
              }`}
            >
              <div className="flex items-start gap-3">
                {studioNotice.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-violet-300 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold">{studioNotice.title}</h4>
                  <p className="text-xs leading-relaxed opacity-90">{studioNotice.message}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudioNotice(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Konten Halaman Aktif */}
          {renderActivePageContent()}

          {/* FOOTER RESMI MIKEYVERSE ANIMATION */}
          <footer className="mt-12 pt-6 border-t border-violet-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              <span className="font-semibold text-violet-200">MIKEYVERSE AUDIO STUDIO</span>
              <span>— AI Speech Generator</span>
            </div>
            <p className="font-medium text-slate-300 text-center sm:text-right">
              © 2026 MikeyVerse Animation. All Rights Reserved.
            </p>
          </footer>
        </main>
      </div>

      {/* BOTTOM NAVIGATION BAR KHUSUS SMARTPHONE */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#090D18]/95 backdrop-blur-xl border-t border-violet-500/25 px-2 py-1.5">
        <div className="grid grid-cols-6 gap-1 max-w-lg mx-auto">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveMenu(item.id)}
                className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive ? 'text-violet-300 bg-violet-500/15' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-medium truncate max-w-full">
                  {item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* MODAL INSPEKTOR PAYLOAD GEMINI TTS API (MEMUDAHKAN INTEGRASI BACKEND) */}
      {showPayloadModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1424] border border-violet-400/40 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-5 py-4 bg-[#141C33] border-b border-violet-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-violet-300" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Struktur Payload Backend Gemini TTS API
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Siap dikirim ke endpoint backend yang aman tanpa mengekspos API Key di client
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPayloadModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                <strong>Catatan Integrasi:</strong> Saat ini aplikasi berjalan sebagai antarmuka frontend penuh (API belum dihubungkan dan tidak menggunakan audio simulasi). JSON di bawah ini dibentuk secara dinamis dari seluruh pengaturan <em>Speaker Mode, Voice Settings, Enhance Intonation, Audio Reference</em>, dan <em>Text to Speech</em> Anda.
              </div>

              <div className="relative">
                <pre className="bg-[#070B14] text-violet-200 p-4 rounded-xl border border-violet-500/25 text-xs font-mono overflow-x-auto leading-relaxed">
                  {JSON.stringify(geminiBackendPayload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-[#090D18] border-t border-violet-500/20 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyPayload}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2"
              >
                {copiedPayload ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedPayload ? 'Payload Tersalin!' : 'Salin JSON Payload'}
              </button>
              <button
                type="button"
                onClick={() => setShowPayloadModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}