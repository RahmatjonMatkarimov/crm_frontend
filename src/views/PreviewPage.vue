<template>
  <div class="bg-[#e8e8e8] font-['Inter',sans-serif] flex flex-col items-center py-10 px-5 min-h-screen gap-6">

    <!-- Top bar -->
    <div
      class="w-full max-w-[1130px] flex items-center justify-between bg-[#1A3A6B] px-6 py-[14px] rounded-lg print:hidden">
      <h1 class="text-white text-base font-bold tracking-[0.03em]">{{ $t('Qabul Kartasi') }}</h1>
      <div class="flex gap-3">
        <button
          class="px-5 py-2 bg-white/15 text-white border border-white/30 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-white/25 transition-colors"
          @click="goBack">← {{ $t('Orqaga') }}</button>
        <button
          class="px-6 py-2 bg-[#2E8B57] text-white border-none rounded-md text-[13px] font-bold cursor-pointer hover:bg-[#25734a] disabled:bg-[#6b7280] disabled:cursor-not-allowed transition-colors"
          :disabled="saving" @click="confirmAndSave">{{ saving ? $terms('Saqlanmoqda...') : $t('Saqlash va Chop etish'
          )}}</button>
      </div>
    </div>

    <!-- Asosiy kontent: chek + kartalar -->
    <div class="flex gap-8 items-start justify-center w-full max-w-[1130px]">

      <!-- ========= CHEK ========= -->
      <div class="flex flex-col print:hidden">
        <div class="text-[10px] font-bold tracking-[2px] uppercase text-[#888] mb-2">Qabul cheki (80mm)</div>
        <div
          class="w-[302px] bg-white font-mono text-black text-[12px] px-5 py-10 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
          <div class="text-center">
            <div class="text-[13px] font-bold uppercase mb-0.5">Yuridik Xizmatlar va Hujjatlar Tayyorlash Byurosi</div>
            <div class="text-[11px] mb-[10px]">QABUL CHEKI</div>
          </div>
          <div class="border-t border-dashed border-black my-2"></div>
          <div class="flex justify-between my-1"><span class="font-bold">Sana:</span><span>{{ d.formattedDate }}</span>
          </div>
          <div class="flex justify-between my-1"><span class="font-bold">ID:</span><span>{{ d.mijozId }}</span></div>
          <div class="border-t border-dashed border-black my-2"></div>
          <div class="text-center">
            <div class="font-bold">MIJOZ</div>
            <div class="text-[15px] font-bold my-[10px] break-words">{{ d.fish }}</div>
          </div>
          <div class="border-t border-dashed border-black my-2"></div>
          <div class="border-2 border-black text-center py-[10px] my-[10px]">
            <div class="text-[42px] font-bold leading-none">{{ d.qabulRaqam }}</div>
            <div class="text-[12px] mt-[5px] font-bold">NAVBAT RAQAMI</div>
          </div>
          <div class="border-t border-dashed border-black my-2"></div>
          <div class="text-center text-[11px] mt-[10px] leading-[1.5]">
            <b>Eslatma</b><br>
            Ushbu chekni saqlab qo'ying.<br>
            Navbatni tekshirish uchun ID raqamdan foydalaning.
          </div>
          <div class="border-t border-dashed border-black my-2"></div>
          <div class="text-center mt-3 text-[10px]"><br><br>Tashrifingiz uchun rahmat!</div>
        </div>
      </div>

      <!-- Kartalar ustun -->
      <div class="flex flex-col gap-6">
        <div class="text-[10px] font-bold tracking-[2px] uppercase text-[#888] mb-[-16px] print:hidden">Oldi tomoni (A4)
        </div>

        <!-- ========= OLDI TOMONI ========= -->
        <div
          class="w-[210mm] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.13)] rounded-sm h-[297mm] overflow-hidden flex flex-col justify-between">
          <div>
            <!-- Header -->
            <div class="bg-[#1a2744] px-[30px] py-[22px] flex items-center justify-center gap-4">
              <div>
                <img src="/logo-white.png" width="200" alt="" />
              </div>
              <div class="flex flex-col items-center justify-center">
                <div
                  class="font-['Playfair_Display',serif] text-[25px] font-bold text-white leading-[1.4] text-center uppercase tracking-[0.4px] max-w-[500px]">
                  Юридик Хизматлар ва Ҳужжатлар Тайёрлаш Бюроси
                </div>
                <div class="flex items-center gap-5 mt-1">
                  <div class="text-[10px] text-white/83 tracking-[0.3px] leading-[1.5]">
                    Мижоз қабул картаси — ички ҳисоб ва қабулни рўйхатга олиш ҳужжати
                  </div>
                  <div class="bg-[#c8a84b] px-[5px] py-[3px] text-black rounded text-[10px] font-semibold">
                    {{ d.mijozId }}
                  </div>
                </div>
              </div>
            </div>

            <div class="px-[30px]">
              <!-- Title + gold bar -->
              <div class="flex justify-between items-center mt-[10px] mb-[5px]">
                <div class="font-semibold text-[#1a2744] text-[20px]">Кабул картаси</div>
                <div class="text-[#bebebe] text-[10px] font-semibold">Шартнома ёки тўлов ҳужжати эмас</div>
              </div>
              <div class="h-[2px] bg-[linear-gradient(90deg,#c8a84b,#f0d080,#c8a84b)]"></div>

              <!-- Meta row -->
              <div class="flex gap-5">
                <div class="flex-1 py-3">
                  <div class="text-[10px] font-semibold uppercase tracking-[1px] text-[#999] mb-1.5">Навбат рақами №
                  </div>
                  <div class="text-[15px] text-[#1a2744] font-medium">{{ d.qabulRaqam }}</div>
                  <div class="h-px bg-[#1a2744] mt-0.5"></div>
                </div>
                <div class="flex-1 py-3">
                  <div class="text-[10px] font-semibold uppercase tracking-[1px] text-[#999] mb-1.5">Берилган сана</div>
                  <div class="text-[15px] text-[#1a2744] font-medium">{{ d.formattedDate }}</div>
                  <div class="h-px bg-[#1a2744] mt-0.5"></div>
                </div>
                <div class="flex-1 py-3">
                  <div class="text-[10px] font-semibold uppercase tracking-[1px] text-[#999] mb-1.5">Амал қилиш муддати
                  </div>
                  <span
                    class="inline-block bg-[#f0f4ff] text-[#1a2744] text-[10px] font-semibold px-[7px] py-[2px] rounded-[20px] tracking-[0.5px] mt-1 border border-[#c8d0e8]">7
                    иш куни</span>
                  <div class="text-[12px] text-[#1a2744] font-medium mt-1">{{ d.expireDate }}</div>
                </div>
              </div>

              <!-- Mijoz ma'lumotlari -->
              <div class="font-semibold text-[#1a2744] text-[20px] mt-[10px] mb-[5px]">Мижоз маълумотлари</div>
              <div class="h-[2px] bg-[linear-gradient(90deg,#c8a84b,#f0d080,#c8a84b)]"></div>

              <div class="flex flex-col py-[14px] gap-3">
                <div class="flex items-end justify-between gap-[50px]">
                  <div class="flex-1 block text-[10px] font-semibold uppercase tracking-[1px] text-[#999]">
                    <label>Мижоз Ф.И.Ш.</label>
                    <div class="border-b border-black mt-[10px] h-5 text-[12px] text-[#1a2744] font-medium leading-5">{{
                      d.fish }}</div>
                  </div>
                </div>
                <div class="flex items-end justify-between gap-[50px]">
                  <div class="flex-1 block text-[10px] font-semibold uppercase tracking-[1px] text-[#999]">
                    <label>Телефон рақами</label>
                    <div class="border-b border-black mt-[10px] h-5 text-[12px] text-[#1a2744] font-medium leading-5">{{
                      d.phone }}</div>
                  </div>
                  <div class="flex-1 block text-[10px] font-semibold uppercase tracking-[1px] text-[#999]">
                    <label>Яшаш манзили</label>
                    <div class="border-b border-black mt-[10px] h-5 text-[12px] text-[#1a2744] font-medium leading-5">{{
                      d.fullAddress }}</div>
                  </div>
                </div>
              </div>

              <!-- Murojaat mavzusi -->
              <div class="font-semibold text-[#1a2744] text-[20px] mt-[10px] mb-[5px]">Мурожаат мавзуси</div>
              <div class="h-[2px] bg-[linear-gradient(90deg,#c8a84b,#f0d080,#c8a84b)]"></div>

              <div class="border-2 border-[#c8a84b] rounded-[10px] mt-5 mb-5 p-[10px] flex flex-col gap-[7.2px]">
                <div class="border-b border-black py-[7.2px]"></div>
                <div class="border-b border-black py-[7.2px]"></div>
                <div class="border-b border-black py-[7.2px]"></div>
                <div class="border-b border-black py-[7.2px]"></div>
              </div>
              <b class="text-[14px]">Юрист изоҳи</b>
              <div class="flex flex-col gap-[7.2px] mt-1">
                <div class="border-b border-black py-[7.2px]"></div>
                <div class="border-b border-black py-[7.2px]"></div>
                <div class="border-b border-black py-[7.2px]"></div>
                <div class="border-b border-black py-[7.2px]"></div>
              </div>

              <!-- Qabul natijasi -->
              <div class="font-semibold text-[#1a2744] text-[20px] mt-5 mb-[5px]">Қабул натижаси / йўналтириш</div>
              <div class="h-[2px] bg-[linear-gradient(90deg,#c8a84b,#f0d080,#c8a84b)]"></div>

              <div class="border-2 border-[#c8a84b] rounded-[10px] mt-[10px] mb-[10px] p-[10px] flex flex-col gap-2">
                <div v-for="item in checkItems" :key="item" class="flex items-start gap-[10px]">
                  <div class="w-[14px] h-[14px] border-[1.5px] border-[#c8a84b] rounded-sm flex-shrink-0 mt-[1px]">
                  </div>
                  <span class="text-[14px] text-[#2c3a5c] leading-[1.4]">{{ item }}</span>
                </div>
              </div>

              <!-- Yurist + imzo -->
              <div class="flex items-end justify-between gap-[50px] mt-1">
                <div class="flex-1 block text-[10px] font-semibold uppercase tracking-[1px] text-[#999]">
                  <label>Қабулни амалга оширган юрист</label>
                  <div class="border-b border-black mt-[10px] h-5 text-[12px] text-[#1a2744] font-medium leading-5">{{
                    d.yuristName }}</div>
                </div>
                <div class="flex-1 block text-[10px] font-semibold uppercase tracking-[1px] text-[#999]">
                  <label>Юрист имзоси</label>
                  <div class="border-b border-black mt-[30px] w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div><!-- /oldi tomoni -->

        <div class="text-[10px] font-bold tracking-[2px] uppercase text-[#888] mt-4 mb-[-16px] print:hidden">Orqa tomoni
          (A4)</div>

        <!-- ========= ORQA TOMONI ========= -->
        <div
          class="w-[210mm] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.13)] rounded-sm h-[297mm] overflow-hidden flex flex-col justify-between">
          <div>
            <!-- Back header -->
            <div class="bg-[#1a2744] px-[30px] py-[18px] flex flex-col">
              <div class="font-['Playfair_Display',serif] text-[30px] font-bold text-white tracking-[0.3px]">Қабул
                Картаси Шартлари</div>
            </div>
            <div class="h-[2px] bg-[linear-gradient(90deg,#c8a84b,#f0d080,#c8a84b)]"></div>

            <!-- Terms -->
            <div class="px-6 py-5 flex flex-col">
              <div v-for="(term, i) in terms" :key="i"
                class="flex gap-[14px] py-[10px] border-b border-[#f0f2f7] last:border-b-0">
                <div
                  class="w-[30px] h-[30px] bg-[#c8a84b] text-[#1a2744] rounded-full text-[16px] font-bold flex items-center justify-center flex-shrink-0 mt-[1px]">
                  {{ i + 1 }}</div>
                <div class="text-[16px] text-[#3a4460] leading-[1.6]" v-html="term"></div>
              </div>
            </div>
          </div>

          <div>
            <!-- Cabinet QR block -->
            <div
              class="mx-6 mb-5 bg-[linear-gradient(135deg,#f5f7fb_0%,#eef1f9_100%)] border border-[#d8ddf0] rounded-md px-5 py-4 flex items-center gap-5">
              <div
                class="w-16 h-16 border-2 border-[#1a2744] rounded flex items-center justify-center flex-shrink-0 bg-white">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="14" height="14" rx="1" fill="#1a2744" />
                  <rect x="4" y="4" width="10" height="10" rx="0.5" fill="white" />
                  <rect x="6" y="6" width="6" height="6" rx="0.5" fill="#1a2744" />
                  <rect x="32" y="2" width="14" height="14" rx="1" fill="#1a2744" />
                  <rect x="34" y="4" width="10" height="10" rx="0.5" fill="white" />
                  <rect x="36" y="6" width="6" height="6" rx="0.5" fill="#1a2744" />
                  <rect x="2" y="32" width="14" height="14" rx="1" fill="#1a2744" />
                  <rect x="4" y="34" width="10" height="10" rx="0.5" fill="white" />
                  <rect x="6" y="36" width="6" height="6" rx="0.5" fill="#1a2744" />
                  <rect x="20" y="2" width="4" height="4" fill="#1a2744" />
                  <rect x="26" y="2" width="4" height="4" fill="#1a2744" />
                  <rect x="20" y="8" width="4" height="4" fill="#1a2744" />
                  <rect x="26" y="8" width="4" height="4" fill="#1a2744" />
                  <rect x="20" y="20" width="6" height="6" fill="#1a2744" />
                  <rect x="28" y="20" width="4" height="4" fill="#1a2744" />
                  <rect x="34" y="20" width="4" height="4" fill="#1a2744" />
                  <rect x="40" y="20" width="6" height="6" fill="#1a2744" />
                  <rect x="20" y="28" width="4" height="4" fill="#1a2744" />
                  <rect x="26" y="28" width="4" height="4" fill="#1a2744" />
                  <rect x="34" y="28" width="6" height="6" fill="#1a2744" />
                  <rect x="20" y="34" width="4" height="4" fill="#1a2744" />
                  <rect x="26" y="40" width="4" height="4" fill="#1a2744" />
                  <rect x="34" y="40" width="6" height="4" fill="#1a2744" />
                  <rect x="42" y="34" width="4" height="4" fill="#1a2744" />
                </svg>
              </div>
              <div>
                <div class="text-[9px] font-bold uppercase tracking-[1.5px] text-[#1a2744] mb-1">Мижоз Кабинети</div>
                <div class="text-[9.5px] text-[#5a6480] leading-[1.5] mb-2">Ҳужжатлар ҳолатини кузатиш ва онлайн
                  хизматлардан фойдаланиш учун QR-кодни сканер қилинг.</div>
                <div class="text-[10px] font-semibold text-[#c8a84b] tracking-[0.3px]">www.arizasud.uz</div>
                <div class="mt-2 flex items-center gap-2.5">
                  <label class="text-[8px] font-semibold uppercase tracking-[1px] text-[#999]">Мижоз ID:</label>
                  <div class="flex-1 border-b border-[#c0c8d8] h-5 text-[11px] text-[#1a2744]">{{ d.mijozId }}</div>
                  <div class="flex-1 border-b border-[#c0c8d8] h-5"></div>
                </div>
              </div>
            </div>

            <!-- Back sign area -->
            <div class="mx-6 mb-5 border-t border-[#e2e6f0] pt-[14px] flex items-end gap-5">
              <div class="flex-1 text-[8.5px] text-[#7a8499] leading-[1.5] italic">
                Мижоз тасдиғи: ушбу қабул картасининг олди ва орқа томонидаги шартлар билан танишганлигимни
                тасдиқлайман.<br>
                <em>Мижоз имзоси қўйилади. Мазкур карта қабулни рўйхатга олиш учун мўлжалланган.</em>
              </div>
              <div class="text-right flex-shrink-0">
                <label class="block text-[7.5px] font-semibold uppercase tracking-[1px] text-[#999] mb-[10px]">Мижоз
                  имзоси</label>
                <div class="w-[140px] border-b border-[#1a2744] h-6"></div>
              </div>
            </div>
          </div>
        </div><!-- /orqa tomoni -->

      </div><!-- /kartalar ustun -->

    </div><!-- /asosiy flex row -->

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const d = ref({})
const saving = ref(false)

const checkItems = [
  'Дастлабки ҳуқуқий маслаҳат ва тушунтириш берилди',
  'Шартнома асосида юридик хизмат кўрсатиш тавсия этилди',
  'Юридик хизмат кўрсатиш шартномаси расмийлаштирилди',
  'Ҳужжатларни расмийлаштириш бўлимига юборилди',
  'Ижро бўлимига юборилди',
]

const terms = [
  'Ушбу қабул картаси берилган санадан бошлаб <strong>7 (етти) иш куни</strong> давомида амал қилади.',
  'Қабул картаси мурожаат этувчининг ҳуқуқий маслаҳат олиши учун расмий ҳужжат ҳисобланади ҳамда ундан кейинги ҳуқуқий маслаҳатлар бўйича мурожаатларда ҳам фойдаланилиши мумкин.',
  'Мазкур қабул картаси мижозга ҳуқуқий маслаҳат ва тушунтириш берилганлигини тасдиқлайди.',
  'Ҳуқуқий ҳужжатлар тайёрлаш, судга ёки давлат органларига мурожаатлар тайёрлаш, ҳуқуқий ҳамроҳлик қилиш ва бошқа юридик хизматлар <strong>алоҳида шартнома</strong> асосида амалга оширилади.',
  'Зарур ҳолларда мижоз юридик хизмат кўрсатиш шартномасини расмийлаштириш, ҳуқуқий ҳужжатларни тайёрлаш ва кейинги ижро ҳаракатларини амалга ошириш учун тегишли бўлимларга йўналтирилади.',
  'Юридик маслаҳат мижоз томонидан тақдим этилган маълумотлар ва ҳужжатларга асосланиб берилади. Тақдим этилган маълумотлар ва ҳужжатларнинг ҳаққонийлиги учун <strong>мижоз жавобгар ҳисобланади.</strong>',
  'Қабул картасининг амал қилиш муддати тугагач, мазкур карта бўйича хизмат кўрсатиш тўхтатилади. Юридик хизмат кўрсатиш шартномаси расмийлаштирилган ҳолатлар бундан мустасно.',
  'Қабул картаси шартнома, чек ёки молиявий ҳисоб-китобни тасдиқловчи ҳужжат ҳисобланмайди.',
]

const formatDateTime = (date) => {
  return (
    String(date.getDate()).padStart(2, '0') + '.' +
    String(date.getMonth() + 1).padStart(2, '0') + '.' +
    date.getFullYear() + ' ' +
    String(date.getHours()).padStart(2, '0') + ':' +
    String(date.getMinutes()).padStart(2, '0')
  )
}

const goBack = () => window.close()

const confirmAndSave = async () => {
  saving.value = true
  if (window.opener && window.opener.__doSaveAndPrint) {
    await window.opener.__doSaveAndPrint(window)
  } else {
    alert('Xatolik: ota oyna topilmadi!')
    saving.value = false
  }
}

onMounted(() => {
  const raw = sessionStorage.getItem('previewData')
  const parsed = raw ? JSON.parse(raw) : {}

  const sana = parsed.sana ? new Date(Number(parsed.sana)) : new Date()
  const expireDate = new Date(sana)
  expireDate.setDate(expireDate.getDate() + 8)

  d.value = {
    mijozId: parsed.mijozId || 'MJZ-****',
    qabulRaqam: parsed.qabulRaqam || 'A-**',
    fish: parsed.fish,
    phone: parsed.phone,
    fullAddress: parsed.fullAddress,
    yuristName: parsed.yuristName,
    formattedDate: formatDateTime(sana),
    expireDate: formatDateTime(expireDate),
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@300;400;500;600&display=swap');

@media print {
  @page {
    size: A4;
    margin: 0;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: #fff;
    display: block;
  }

  body>div {
    background: #fff !important;
    padding: 0 !important;
    gap: 0 !important;
  }

  .shadow-\[0_8px_40px_rgba\(0\,0\,0\,0\.13\)\] {
    box-shadow: none !important;
  }
}
</style>
