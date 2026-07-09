<template>
    <div>
        <div class="max-w-7xl mx-auto">

            <!-- Loading -->
            <div v-if="loading" class="flex flex-col items-center justify-center py-32 gap-3">
                <div class="w-8 h-8 border-2 rounded-full animate-spin"
                    style="border-color:var(--border); border-top-color:var(--primary);"></div>
                <p class="text-[var(--text-2)] text-sm">{{ $t("Ma'lumotlar yuklanmoqda...") }}</p>
            </div>

            <!-- Not found -->
            <div v-else-if="!customer" class="p-8 rounded-xl text-center"
                style="background:var(--danger-bg); border:1px solid var(--danger-border);">
                <p class="text-lg font-medium" style="color:var(--danger);">{{ $t('Mijoz topilmadi') }}</p>
            </div>

            <div v-else class="space-y-5">

                <!-- Hero Header -->
                <div class="overflow-hidden card">
                    <div class="px-6 py-5 flex items-center justify-between gap-4">
                        <div class="flex items-center gap-5">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl font-bold text-white"
                                style="background:linear-gradient(135deg,var(--primary),var(--primary-hover));">
                                {{ (customer.surname || customer.name || '?').charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <h1 class="text-xl font-bold leading-tight" style="color:var(--text-1);">
                                    {{ $t(customer.surname) }} {{ $t(customer.name) }} {{ $t(customer.father_name || '')
                                    }}
                                </h1>
                                <div class="flex items-center gap-2 mt-1 flex-wrap">
                                    <span class="inline-flex items-center gap-1 text-xs" style="color:var(--text-2);">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                        </svg>
                                        {{ customer.phone || '-' }}
                                    </span>
                                    <span v-if="customer.customer_id" class="text-xs"
                                        style="color:var(--text-3);">•</span>
                                    <span v-if="customer.customer_id" class="gov-badge gov-badge-blue">
                                        ID: MJZ-{{ customer.customer_id }}
                                    </span>
                                    <span v-if="customer.queueNumber" class="gov-badge gov-badge-blue">
                                        {{ $t("Navbat") }}: A-{{ String(customer.queueNumber).padStart(2, '0') }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button @click="goBack" class="btn btn-ghost">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            {{ $t('Orqaga') }}
                        </button>
                    </div>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    <!-- Left column: Mijoz haqida + To'lov Tarixi -->
                    <div class="lg:col-span-2 flex flex-col gap-5">

                        <!-- Main Info Card -->
                        <div class="card p-6 space-y-4">
                            <div class="flex items-center gap-2.5">
                                <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style="background:var(--primary); color:#fff;">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                </span>
                                <h3 class="text-sm font-bold" style="color:var(--text-1);">{{ $t('Mijoz haqida') }}</h3>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoRow :label="$t('F.I.Sh')"
                                    :value="`${$t(customer.surname || '')} ${$t(customer.name || '')} ${$t(customer.father_name || '')}`"
                                    icon="user" />
                                <InfoRow :label="$t('Telefon raqam')" :value="customer.phone || '-'" icon="phone" />
                                <div class="flex flex-col gap-1">
                                    <p class="text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider">{{
                                        $t('Telegram') }}</p>
                                    <div class="flex items-center gap-2">
                                        <p class="text-sm font-semibold" :class="'text-[var(--text-1)]'">
                                            {{ customer.telegram || '-' }}
                                        </p>
                                    </div>
                                </div>
                                <InfoRow :label="$t('Manzil')"
                                    :value="`${$t(customer.address || '')} ${customer.region || customer.district ? `(${$t(customer.region)} ${$t(customer.district)})` : ''}`"
                                    icon="location" />
                                <InfoRow :label="$t('Maslahat narxi')"
                                    :value="`${Number(customer.price || 0).toLocaleString()} ${$t('so\'m')}`"
                                    icon="money" highlight />
                            </div>

                            <!-- Description -->
                            <div v-if="authStore.userRole === 'YURIST'">
                                <div class="rounded-lg p-4"
                                    :class="'bg-[var(--border-light)] border border-[var(--border)]'">
                                    <p
                                        class="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-2)] mb-2">
                                        {{ $t('Izoh / Tavsif') }}
                                    </p>
                                    <p class="text-sm whitespace-pre-wrap"
                                        :class="themeStore.isDark ? 'text-[var(--text-2)]' : 'text-[var(--text-1)]'">
                                        {{ $t(customer.description) || $t("Izoh yo'q") }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Payment History -->
                        <div class="card overflow-hidden">
                            <div class="px-6 pt-6 pb-4 flex items-center justify-between">
                                <div class="flex items-center gap-2.5">
                                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style="background:var(--success); color:#fff;">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3M3.75 6h16.5a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5v-9a1.5 1.5 0 011.5-1.5z" />
                                        </svg>
                                    </span>
                                    <h3 class="text-sm font-bold" style="color:var(--text-1);">
                                        {{ $t("To'lov Tarixi") }}
                                    </h3>
                                </div>
                                <span class="text-xs font-medium px-2.5 py-1 rounded-lg"
                                    :class="'bg-[var(--border-light)] text-[var(--text-2)]'">
                                    {{ payments.length }} {{ $t('ta') }}
                                </span>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead>
                                        <tr :class="'border-b border-[var(--border)]'">
                                            <th
                                                class="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-2)]">
                                                {{ $t('Sana') }}
                                            </th>
                                            <th
                                                class="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-2)]">
                                                {{ $t('Summa') }}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y" :class="'divide-[var(--border)]'">
                                        <tr v-for="payment in payments" :key="payment.id" class="transition-colors"
                                            :class="'hover:bg-[var(--border-light)]'">
                                            <td class="px-6 py-4 text-sm"
                                                :class="themeStore.isDark ? 'text-[var(--text-2)]' : 'text-[var(--text-3)]'">
                                                {{ formatDate(payment.createdAt) }}
                                            </td>
                                            <td class="px-6 py-4">
                                                <span
                                                    class="inline-flex items-center gap-1 text-sm font-semibold text-[var(--success)]">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                        viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
                                                        class="w-3.5 h-3.5">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            d="M12 4.5v15m7.5-7.5h-15" />
                                                    </svg>
                                                    {{ Number(payment.amount).toLocaleString() }} {{ $t("so'm") }}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr v-if="payments.length === 0">
                                            <td colspan="2" class="px-6 py-16 text-center">
                                                <div class="flex flex-col items-center gap-3">
                                                    <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                                                        :class="'bg-[var(--border-light)]'">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                                                            class="w-6 h-6 text-[var(--text-2)]">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                                        </svg>
                                                    </div>
                                                    <p class="text-sm text-[var(--text-2)]">
                                                        {{ $t("Hali hech qanday to'lov yo'q") }}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <!-- Status History -->
                        <div class="card overflow-hidden">
                            <div class="px-6 pt-6 pb-4 flex items-center justify-between">
                                <div class="flex items-center gap-2.5">
                                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style="background:var(--info); color:#fff;">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    </span>
                                    <h3 class="text-sm font-bold" style="color:var(--text-1);">
                                        {{ $t('Ish Tarixi') }}
                                    </h3>
                                </div>
                                <span class="text-xs font-medium px-2.5 py-1 rounded-lg"
                                    :class="'bg-[var(--border-light)] text-[var(--text-2)]'">
                                    {{ statusHistory.length }} {{ $t('ta') }}
                                </span>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead>
                                        <tr :class="'border-b border-[var(--border)]'">
                                            <th
                                                class="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-2)]">
                                                {{ $t('Sana') }}
                                            </th>
                                            <th
                                                class="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-2)]">
                                                {{ $t('ISH holati') }}
                                            </th>
                                            <th
                                                class="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-2)]">
                                                {{ $t("O'zgartirgan") }}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y" :class="'divide-[var(--border)]'">
                                        <tr v-for="entry in statusHistory" :key="entry.id" class="transition-colors"
                                            :class="'hover:bg-[var(--border-light)]'">
                                            <td class="px-6 py-4 text-sm"
                                                :class="themeStore.isDark ? 'text-[var(--text-2)]' : 'text-[var(--text-3)]'">
                                                {{ formatDate(entry.changedAt) }}
                                            </td>
                                            <td class="px-6 py-4">
                                                <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
                                                    :style="`background:${(statusInlineColors[entry.toStatus] || statusInlineColors.NAVBATDA).bg}; color:${(statusInlineColors[entry.toStatus] || statusInlineColors.NAVBATDA).color};`">
                                                    {{ entry.note || statusLabels[entry.toStatus] || entry.toStatus }}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 text-sm"
                                                :class="themeStore.isDark ? 'text-[var(--text-2)]' : 'text-[var(--text-3)]'">
                                                <template v-if="entry.changedByUser">
                                                    {{ $t(entry.changedByUser.name) }} {{ $t(entry.changedByUser.surname) }}
                                                </template>
                                                <template v-else>—</template>
                                            </td>
                                        </tr>
                                        <tr v-if="statusHistory.length === 0">
                                            <td colspan="3" class="px-6 py-16 text-center">
                                                <div class="flex flex-col items-center gap-3">
                                                    <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                                                        :class="'bg-[var(--border-light)]'">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                                                            class="w-6 h-6 text-[var(--text-2)]">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                        </svg>
                                                    </div>
                                                    <p class="text-sm text-[var(--text-2)]">
                                                        {{ $t("Hali status tarixi yo'q") }}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Checks -->
                        <div class="card overflow-hidden">
                            <div class="px-6 pt-6 pb-4 flex items-center justify-between">
                                <div class="flex items-center gap-2.5">
                                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style="background:var(--warning); color:#fff;">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                    </span>
                                    <h3 class="text-sm font-bold" style="color:var(--text-1);">
                                        {{ $t('Cheklar') }}
                                    </h3>
                                </div>
                                <span class="text-xs font-medium px-2.5 py-1 rounded-lg"
                                    :class="'bg-[var(--border-light)] text-[var(--text-2)]'">
                                    {{ checks.length }} {{ $t('ta') }}
                                </span>
                            </div>

                            <div v-if="checks.length > 0"
                                class="px-6 pb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <div v-for="check in checks" :key="check.id" @click="openCheck(check)"
                                    class="group cursor-pointer rounded-lg overflow-hidden border transition-all hover:shadow-lg hover:-translate-y-0.5"
                                    style="background:var(--border-light); border-color:var(--border);">
                                    <div class="aspect-video flex items-center justify-center overflow-hidden"
                                        :class="'bg-[var(--border-light)]'">
                                        <img v-if="isImage(check.checkUrl)" :src="check.checkUrl"
                                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            alt="Check" />
                                        <div v-else-if="isPDF(check.checkUrl)"
                                            class="flex flex-col items-center justify-center gap-2">
                                            <span class="text-4xl">📕</span>
                                            <span class="text-xs font-medium text-[var(--text-2)]">PDF</span>
                                        </div>
                                        <span v-else class="text-5xl opacity-50">📄</span>
                                    </div>
                                    <div class="p-3">
                                        <p class="text-xs text-[var(--text-2)]">
                                            {{ formatDate(check.createdAt) }}
                                        </p>
                                        <p class="text-xs font-medium mt-1.5 flex items-center gap-1"
                                            style="color:var(--primary);">
                                            {{ $t('Ochish') }}
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                stroke-width="2" stroke="currentColor" class="w-3 h-3">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                            </svg>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="p-16 text-center">
                                <div class="flex flex-col items-center gap-3">
                                    <div class="w-14 h-14 rounded-lg flex items-center justify-center"
                                        :class="'bg-[var(--border-light)]'">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.5" stroke="currentColor"
                                            class="w-7 h-7 text-[var(--text-2)]">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                    </div>
                                    <p class="text-sm text-[var(--text-2)]">
                                        {{ $t('Bu mijoz uchun hali check yuklanmagan') }}
                                    </p>
                                </div>
                            </div>

                        </div>

                        <!-- Hujjatlar -->
                        <div class="card overflow-hidden">
                            <div class="px-6 pt-6 pb-4 flex items-center justify-between">
                                <div class="flex items-center gap-2.5">
                                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style="background:var(--info); color:#fff;">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-3.5 h-3.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                    </span>
                                    <h3 class="text-sm font-bold" style="color:var(--text-1);">
                                        {{ $t('Hujjatlar') }}
                                    </h3>
                                </div>
                                <span class="text-xs font-medium px-2.5 py-1 rounded-lg"
                                    :class="'bg-[var(--border-light)] text-[var(--text-2)]'">
                                    {{ documents.length }} {{ $t('ta') }}
                                </span>
                            </div>

                            <div v-if="documents.length > 0"
                                class="px-6 pb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <div v-for="doc in documents" :key="doc.id" @click="openDocument(doc)"
                                    class="group cursor-pointer rounded-lg overflow-hidden border transition-all hover:shadow-lg hover:-translate-y-0.5"
                                    style="background:var(--border-light); border-color:var(--border);">
                                    <div class="aspect-video flex items-center justify-center overflow-hidden"
                                        :class="'bg-[var(--border-light)]'">
                                        <img v-if="isImage(doc.url)" :src="`${BASE_URL}${doc.url}`"
                                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            alt="Hujjat" />
                                        <div v-else-if="isPDF(doc.url)"
                                            class="flex flex-col items-center justify-center gap-2">
                                            <span class="text-4xl">📕</span>
                                            <span class="text-xs font-medium text-[var(--text-2)]">PDF</span>
                                        </div>
                                        <span v-else class="text-5xl opacity-50">📄</span>
                                    </div>
                                    <div class="p-3">
                                        <p class="text-xs truncate" style="color:var(--text-1);"
                                            :title="doc.originalName">
                                            {{ doc.originalName }}
                                        </p>
                                        <p class="text-xs text-[var(--text-2)] mt-1">
                                            {{ formatDate(doc.createdAt) }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="p-16 text-center">
                                <div class="flex flex-col items-center gap-3">
                                    <div class="w-14 h-14 rounded-lg flex items-center justify-center"
                                        :class="'bg-[var(--border-light)]'">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.5" stroke="currentColor"
                                            class="w-7 h-7 text-[var(--text-2)]">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                    </div>
                                    <p class="text-sm text-[var(--text-2)]">
                                        {{ $t('Bu mijoz uchun hali hujjat yuklanmagan') }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right column: Qo'shimcha + Qo'shimcha amallar -->
                    <div class="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start">

                        <!-- Meta Card -->
                        <div class="card p-6 space-y-5">
                            <div class="flex items-center gap-2.5">
                                <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style="background:var(--gold); color:#fff;">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                    </svg>
                                </span>
                                <h3 class="text-sm font-bold" style="color:var(--text-1);">
                                    {{ $t("Qo'shimcha") }}
                                </h3>
                            </div>
                            <div class="space-y-5">
                                <!-- Status -->
                                <div>
                                    <p
                                        class="text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider mb-2">
                                        {{ $t('Ish jarayoni') }}
                                    </p>
                                    <div class="relative">
                                        <select :value="customer.status || 'NAVBATDA'"
                                            @change="onStatusSelect($event.target.value)" :disabled="statusSaving"
                                            class="w-full pl-3 pr-8 py-2 rounded-xl text-sm font-semibold transition-all focus:outline-none appearance-none cursor-pointer disabled:opacity-60"
                                            :style="`background:${statusInlineColors[customer.status || 'NAVBATDA']?.bg}; color:${statusInlineColors[customer.status || 'NAVBATDA']?.color}; border:1.5px solid ${statusInlineColors[customer.status || 'NAVBATDA']?.color}40;`">
                                            <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{
                                                label }}
                                            </option>
                                        </select>
                                        <svg v-if="!statusSaving"
                                            class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                            :style="`color:${statusInlineColors[customer.status || 'NAVBATDA']?.color}`">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                d="M19 9l-7 7-7-7" />
                                        </svg>
                                        <div v-else
                                            class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
                                            :style="`color:${statusInlineColors[customer.status || 'NAVBATDA']?.color}`">
                                        </div>
                                    </div>
                                </div>
                                    <button v-if="customer.status !== 'BEKOR_QILINDI' && (authStore.user.role === 'ADMIN' || authStore.user.role === 'RAHBAR'||authStore.user.role==='YURIST')" @click="onStatusSelect('BEKOR_QILINDI')"
                                        class="w-full text-xs font-semibold py-2 rounded-lg transition-all"
                                        style="background:var(--danger-bg); color:var(--danger); border:1px solid var(--danger-border);">
                                        {{ $t("Rad etish") }}
                                    </button>
                                    <Transition name="slide-fade">
                                        <div v-if="showRejectModal" class="mt-2 rounded-lg pl-3 pr-2.5 py-2.5 space-y-2"
                                            style="background:var(--bg-card); border:1px solid var(--danger-border); border-left:3px solid var(--danger);">
                                            <div class="flex items-center justify-between gap-2">
                                                <label class="text-[11px] font-bold uppercase tracking-wider"
                                                    style="color:var(--danger);">
                                                    {{ $t('Rad etilish sababi') }}
                                                </label>
                                                <button @click="closeRejectModal"
                                                    class="w-5 h-5 rounded flex items-center justify-center shrink-0"
                                                    style="color:var(--text-2);">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                        stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div v-if="rejectError" class="text-[11px]" style="color:var(--danger);">{{
                                                rejectError }}</div>
                                            <textarea v-model="rejectReason" rows="3"
                                                :placeholder="$t('Rad etilish sababini kiriting')"
                                                class="w-full px-2.5 py-2 rounded-lg border text-xs transition-all focus:outline-none focus:ring-1 focus:ring-[var(--danger)]/20"
                                                style="background:var(--border-light); border-color:var(--border); color:var(--text-1);"></textarea>
                                            <div class="flex justify-end gap-2 pt-0.5">
                                                <button @click="closeRejectModal"
                                                    class="px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                                                    style="color:var(--text-2);">
                                                    {{ $t('Bekor qilish') }}
                                                </button>
                                                <button @click="submitReject" :disabled="rejectSaving"
                                                    class="px-3.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5"
                                                    style="background:var(--danger); color:white;">
                                                    <div v-if="rejectSaving"
                                                        class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70">
                                                    </div>
                                                    {{ $t('Rad etish') }}
                                                </button>
                                            </div>
                                        </div>
                                    </Transition>
                                <!-- Qora ro'yxat -->
                                <div
                                    v-if="authStore.user.role === 'YURIST' || authStore.user.role === 'ADMIN' || authStore.user.role === 'RAHBAR'">
                                    <div v-if="customer.isBlacklisted" class="rounded-lg p-3 space-y-2"
                                        style="background:var(--danger-bg); border:1px solid var(--danger-border);">
                                        <p class="text-xs font-bold" style="color:var(--danger);">
                                            {{ $t("Qora ro'yxatda") }}
                                        </p>
                                        <p class="text-xs" style="color:var(--danger);">{{ $t('Sababi') }}: {{
                                            customer.blacklistReason || '-' }}</p>
                                        <p class="text-[11px]" style="color:var(--danger);">{{
                                            formatDate(customer.blacklistedAt) }}</p>
                                        <button v-if="canManageBlacklist" @click="removeFromBlacklist"
                                            :disabled="blacklistSaving"
                                            class="text-xs font-semibold underline disabled:opacity-60"
                                            style="color:var(--danger);">
                                            {{ $t("Qora ro'yxatdan chiqarish") }}
                                        </button>
                                    </div>
                                    <button v-else-if="canManageBlacklist" @click="openBlacklistModal"
                                        class="w-full text-xs font-semibold py-2 rounded-lg transition-all"
                                        style="background:var(--danger-bg); color:var(--danger); border:1px solid var(--danger-border);">
                                        {{ $t("Qora ro'yxatga qo'shish") }}
                                    </button>
                                    <Transition name="slide-fade">
                                        <div v-if="showBlacklistModal" class="mt-2 rounded-lg pl-3 pr-2.5 py-2.5 space-y-2"
                                            style="background:var(--bg-card); border:1px solid var(--danger-border); border-left:3px solid var(--danger);">
                                            <div class="flex items-center justify-between gap-2">
                                                <label class="text-[11px] font-bold uppercase tracking-wider"
                                                    style="color:var(--danger);">
                                                    {{ $t("Qora ro'yxatga qo'shish sababi") }}
                                                </label>
                                                <button @click="closeBlacklistModal"
                                                    class="w-5 h-5 rounded flex items-center justify-center shrink-0"
                                                    style="color:var(--text-2);">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                        stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div v-if="blacklistError" class="text-[11px]" style="color:var(--danger);">{{
                                                blacklistError }}</div>
                                            <textarea v-model="blacklistReason" rows="3"
                                                :placeholder="$t('Qora ro\'yxatga qo\'shish sababini kiriting')"
                                                class="w-full px-2.5 py-2 rounded-lg border text-xs transition-all focus:outline-none focus:ring-1 focus:ring-[var(--danger)]/20"
                                                style="background:var(--border-light); border-color:var(--border); color:var(--text-1);"></textarea>
                                            <div class="flex justify-end gap-2 pt-0.5">
                                                <button @click="closeBlacklistModal"
                                                    class="px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                                                    style="color:var(--text-2);">
                                                    {{ $t('Bekor qilish') }}
                                                </button>
                                                <button @click="submitBlacklist" :disabled="blacklistSaving"
                                                    class="px-3.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5"
                                                    style="background:var(--danger); color:white;">
                                                    <div v-if="blacklistSaving"
                                                        class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70">
                                                    </div>
                                                    {{ $t("Qo'shish") }}
                                                </button>
                                            </div>
                                        </div>
                                    </Transition>
                                </div>

                                <!-- Rad etish sababi -->
                                <div v-if="customer.status === 'BEKOR_QILINDI' && customer.rejectReason"
                                    class="rounded-lg p-3 space-y-1"
                                    style="background:var(--danger-bg); border:1px solid var(--danger-border);">
                                    <p class="text-xs font-bold" style="color:var(--danger);">
                                        {{ $t('Rad etilish sababi') }}
                                    </p>
                                    <p class="text-xs" style="color:var(--danger);">{{ customer.rejectReason }}</p>
                                    <p class="text-[11px]" style="color:var(--danger);">{{
                                        formatDate(customer.rejectedAt) }}</p>
                                </div>

                                <!-- Konsultatsiya vaqti (faqat YURIST va RAHBAR) -->
                                <div v-if="canSeeTimer && (customer.calledAt || customer.consultationSeconds != null)">
                                    <p
                                        class="text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider mb-1">
                                        {{ $t('Konsultatsiya vaqti') }}
                                    </p>
                                    <ConsultationTimer :called-at="customer.calledAt"
                                        :seconds="customer.consultationSeconds" />
                                </div>

                                <div>
                                    <p
                                        class="text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider mb-1">
                                        {{ $t('Yaratilgan sana') }}
                                    </p>
                                    <p class="text-sm font-semibold" :class="'text-[var(--text-1)]'">
                                        {{ formatDate(customer.createdAt) }}
                                    </p>
                                </div>
                                <div v-if="customer.assignedTo">
                                    <p
                                        class="text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider mb-1">
                                        {{ $t("Mas'ul") }}
                                    </p>
                                    <div class="flex items-center gap-2">
                                        <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                                            style="background:linear-gradient(135deg,var(--primary),var(--primary-hover));">
                                            {{ (customer.assignedTo.name || '?').charAt(0).toUpperCase() }}
                                        </div>
                                        <p class="text-sm font-semibold" :class="'text-[var(--text-1)]'">
                                            {{ $t(customer.assignedTo.name) }} {{ $t(customer.assignedTo.surname) }}
                                        </p>
                                    </div>
                                </div>
                                <div v-if="customer.createdByUser">
                                    <p
                                        class="text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider mb-1">
                                        {{ $t("Yaratgan") }}
                                    </p>
                                    <div class="flex items-center gap-2">
                                        <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                                            style="background:linear-gradient(135deg,var(--primary),var(--primary-hover));">
                                            {{ (customer.createdByUser.name || '?').charAt(0).toUpperCase() }}
                                        </div>
                                        <p class="text-sm font-semibold" :class="'text-[var(--text-1)]'">
                                            {{ $t(customer.createdByUser.name) }} {{ $t(customer.createdByUser.surname)
                                            }}
                                        </p>
                                    </div>
                                </div>

                                <!-- Payment summary -->
                                <div class="pt-4 border-t" :class="'border-[var(--border)]'">
                                    <p
                                        class="text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider mb-3">
                                        {{ $t("To'lovlar") }}
                                    </p>
                                    <div class="space-y-2">
                                        <div class="rounded-xl px-4 py-3 flex items-center justify-between"
                                            style="background:var(--success-bg); border:1px solid var(--success-border);">
                                            <span class="text-xs text-[var(--success)] font-medium">
                                                {{ $t('Jami to\'langan') }}
                                            </span>
                                            <span class="text-sm font-bold text-[var(--success)]">
                                                {{ totalPaid.toLocaleString() }} {{ $t("so'm") }}
                                            </span>
                                        </div>
                                        <div v-if="remainingDebt > 0"
                                            class="rounded-xl px-4 py-3 flex items-center justify-between"
                                            style="background:var(--danger-bg); border:1px solid var(--danger-border);">
                                            <span class="text-xs text-[var(--danger)] font-medium">
                                                {{ $t('Qarz') }}
                                            </span>
                                            <span class="text-sm font-bold text-[var(--danger)]">
                                                {{ remainingDebt.toLocaleString() }} {{ $t("so'm") }}
                                            </span>
                                        </div>
                                        <button v-if="remainingDebt > 0" @click="showDebtModal = true"
                                            class="btn btn-primary w-full mt-1 justify-center">
                                            {{ $t("Qarz to'lash") }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card p-6 space-y-4">
                            <div class="flex items-center gap-2.5">
                                <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style="background:var(--text-1); color:var(--bg-card);">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5M3.75 3h16.5M21.75 3v11.25A2.25 2.25 0 0119.5 16.5H12M12 16.5v3.75m-6 0h12M12 16.5H9" />
                                    </svg>
                                </span>
                                <h3 class="text-sm font-bold" style="color:var(--text-1);">
                                    {{ $t("Qo'shimcha amallar") }}
                                </h3>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <button @click="printQabulxat" class="action-btn">
                                    <span class="action-icon" style="background:var(--primary-light); color:var(--primary);">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M6.72 13.83A2.25 2.25 0 004.5 16.08v3.42a.75.75 0 00.75.75h13.5a.75.75 0 00.75-.75v-3.42a2.25 2.25 0 00-2.22-2.25M6.72 13.83V8.25a.75.75 0 01.75-.75h9.06a.75.75 0 01.75.75v5.58M6.72 13.83h10.56" />
                                        </svg>
                                    </span>
                                    <span class="action-label">{{ $t('Qabul xatini chop etish') }}</span>
                                </button>
                                <button @click="printChek" class="action-btn">
                                    <span class="action-icon" style="background:var(--success-bg); color:var(--success);">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                    </span>
                                    <span class="action-label">{{ $t('Chekni chop etish') }}</span>
                                </button>
                                <button class="action-btn">
                                    <span class="action-icon" style="background:var(--warning-bg); color:var(--warning);">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg>
                                    </span>
                                    <span class="action-label">{{ $t('SMS yuborish') }}</span>
                                </button>
                                <button @click="openAppointmentModal" class="action-btn">
                                    <span class="action-icon" style="background:var(--info-bg); color:var(--info);">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008z" />
                                        </svg>
                                    </span>
                                    <span class="action-label">{{ $t('Qabul vaqtini belgilash') }}</span>
                                </button>
                                <button @click="openPaymentLinkModal" class="action-btn">
                                    <span class="action-icon" style="background:var(--warning-bg); color:var(--warning);">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                        </svg>
                                    </span>
                                    <span class="action-label">{{ $t("To'lov havolasini yuborish") }}</span>
                                </button>
                                <button @click="openTelegramModal" class="action-btn">
                                    <span class="action-icon" style="background:var(--primary-light); color:var(--primary);">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                            viewBox="0 0 24 24" stroke-width="1.8">
                                            <path d="M0 0h24v24H0z" fill="none" />
                                            <path fill="currentColor" fill-rule="evenodd" d="M5.788 14.02a1 1 0 0 0 .132.031a456 456 0 0 1 .844 2.002c.503 1.202 1.01 2.44 1.121 2.796c.139.438.285.736.445.94c.083.104.178.196.29.266a1 1 0 0 0 .186.088c.32.12.612.07.795.009a1.3 1.3 0 0 0 .304-.15L9.91 20l2.826-1.762l3.265 2.502q.072.055.156.093c.392.17.772.23 1.13.182c.356-.05.639-.199.85-.368a2 2 0 0 0 .564-.728l.009-.022l.003-.008l.002-.004v-.002l.001-.001a1 1 0 0 0 .04-.133l2.98-15.025a1 1 0 0 0 .014-.146c0-.44-.166-.859-.555-1.112c-.334-.217-.705-.227-.94-.209c-.252.02-.486.082-.643.132a4 4 0 0 0-.26.094l-.011.005l-16.714 6.556l-.002.001a2 2 0 0 0-.167.069a2.5 2.5 0 0 0-.38.212c-.227.155-.75.581-.661 1.285c.07.56.454.905.689 1.071c.128.091.25.156.34.199c.04.02.126.054.163.07l.01.003zm14.138-9.152h-.002l-.026.011l-16.734 6.565l-.026.01l-.01.003a1 1 0 0 0-.09.04a1 1 0 0 0 .086.043l3.142 1.058a1 1 0 0 1 .16.076l10.377-6.075l.01-.005a2 2 0 0 1 .124-.068c.072-.037.187-.091.317-.131c.09-.028.357-.107.645-.014a.85.85 0 0 1 .588.689a.84.84 0 0 1 .003.424c-.07.275-.262.489-.437.653c-.15.14-2.096 2.016-4.015 3.868l-2.613 2.52l-.465.45l5.872 4.502a.54.54 0 0 0 .251.04a.23.23 0 0 0 .117-.052a.5.5 0 0 0 .103-.12l.002-.001l2.89-14.573a2 2 0 0 0-.267.086zm-8.461 12.394l-1.172-.898l-.284 1.805zm-2.247-2.68l1.165-1.125l2.613-2.522l.973-.938l-6.52 3.817l.035.082a339 339 0 0 1 1.22 2.92l.283-1.8a.75.75 0 0 1 .231-.435" clip-rule="evenodd" />
                                        </svg>
                                    </span>
                                    <span class="action-label">{{ $t('Telegram orqali xabar/fayl yuborish') }}</span>
                                </button>
                                <label class="action-btn col-span-2 cursor-pointer">
                                    <span class="action-icon" style="background:var(--border-light); color:var(--text-1); border:1px solid var(--border);">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                                        </svg>
                                    </span>
                                    <span class="action-label">{{ $t('Fayl yuklash') }}</span>
                                    <input type="file" multiple class="hidden" @change="handleUploadDocuments" />
                                </label>
                            </div>
                            <p v-if="documentUploadError" class="text-xs" style="color:var(--danger);">
                                {{ documentUploadError }}
                            </p>
                        </div>
                    </div>
                </div>



            </div>
        </div>
    </div>

    <!-- Qarz to'lash modal -->
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="showDebtModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
                style="background:var(--overlay);" @click.self="closeDebtModal">
                <div class="w-full max-w-sm rounded-lg shadow-2xl overflow-hidden" :class="'bg-[var(--bg-card)]'">
                    <!-- Header -->
                    <div class="px-6 py-4 flex items-center justify-between border-b"
                        style="border-color:var(--border);">
                        <h3 class="font-bold text-base" style="color:var(--text-1);">{{ $t("Qarz to'lash") }}</h3>
                        <button @click="closeDebtModal" class="w-7 h-7 rounded-lg flex items-center justify-center"
                            style="background:var(--border-light); color:var(--text-2);">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                                stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="p-6 space-y-4">
                        <!-- Qarz ma'lumoti -->
                        <div class="rounded-xl px-4 py-3 flex items-center justify-between"
                            style="background:var(--danger-bg); border:1px solid var(--danger-border);">
                            <span class="text-xs font-medium text-[var(--danger)]">{{ $t('Qolgan qarz') }}</span>
                            <span class="text-sm font-bold text-[var(--danger)]">
                                {{ remainingDebt.toLocaleString() }} {{ $t("so'm") }}
                            </span>
                        </div>

                        <!-- Xato -->
                        <div v-if="debtError" class="text-xs text-[var(--danger)] px-1">{{ debtError }}</div>

                        <!-- Miqdor -->
                        <div class="space-y-1">
                            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-2)]">
                                {{ $t("To'lov miqdori") }} <span class="text-[var(--danger)] text-[16px]">*</span>
                            </label>
                            <input :value="debtAmount" @input="handleDebtAmountInput" type="text" inputmode="numeric"
                                :placeholder="$t('Miqdorni kiriting')"
                                class="w-full px-3 py-2.5 bg-[var(--border-light)] rounded-lg border text-sm transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
                                style="border-color:var(--border); color:var(--text-1);" />
                        </div>

                        <!-- To'lov turi -->
                        <div class="space-y-1">
                            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-2)]">
                                {{ $t("To'lov turi") }} <span class="text-[var(--danger)] text-[16px]">*</span>
                            </label>
                            <select v-model="debtPaymentType"
                                class="w-full px-3 py-2.5 bg-[var(--border-light)] rounded-lg border text-sm transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 appearance-none cursor-pointer"
                                style="border-color:var(--border); color:var(--text-1);">
                                <option v-for="opt in paymentOptions" :key="opt.value" :value="opt.value">
                                    {{ $t(opt.label) }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="px-6 py-4 flex justify-end gap-3 border-t"
                        style="border-color:var(--border); background:var(--border-light);">
                        <button @click="closeDebtModal" class="px-5 py-2 rounded-lg text-sm font-medium"
                            :class="'text-[var(--text-2)]'">
                            {{ $t('Bekor qilish') }}
                        </button>
                        <button @click="payDebt" :disabled="debtSaving" class="btn btn-primary">
                            <div v-if="debtSaving"
                                class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70">
                            </div>
                            {{ $t("To'lash") }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- Qabul vaqtini belgilash modal -->
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="showAppointmentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
                style="background:var(--overlay);" @click.self="closeAppointmentModal">
                <div class="w-full max-w-md rounded-lg shadow-2xl overflow-hidden" :class="'bg-[var(--bg-card)]'">
                    <div class="px-6 py-4 flex items-center justify-between border-b"
                        style="border-color:var(--border);">
                        <h3 class="font-bold text-base" style="color:var(--text-1);">{{ $t('Qabul vaqtini belgilash') }}
                        </h3>
                        <button @click="closeAppointmentModal"
                            class="w-7 h-7 rounded-lg flex items-center justify-center"
                            style="background:var(--border-light); color:var(--text-2);">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                                stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="p-6 space-y-4">
                        <div v-if="appointmentError" class="text-xs text-[var(--danger)] px-1">{{ appointmentError }}
                        </div>
                        <div v-if="appointmentSent" class="text-xs text-[var(--success)] px-1">{{ $t('Xabar yuborildi')
                        }}</div>

                        <div class="space-y-1">
                            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-2)]">
                                {{ $t('Qabul sanasi va vaqti') }}
                            </label>
                            <input type="datetime-local" v-model="appointmentDateTime" @change="onAppointmentDateChange"
                                class="w-full px-3 py-2.5 bg-[var(--border-light)] rounded-lg border text-sm transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
                                style="border-color:var(--border); color:var(--text-1);" />
                        </div>

                        <div class="space-y-1">
                            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-2)]">
                                {{ $t('Xabar matni') }}
                            </label>
                            <textarea v-model="appointmentMessage" rows="5"
                                class="w-full px-3 py-2.5 bg-[var(--border-light)] rounded-lg border text-sm transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
                                style="border-color:var(--border); color:var(--text-1);"></textarea>
                        </div>

                        <p class="text-xs" style="color:var(--text-3);">
                            {{ $t('Yuboriladi') }}: {{ customer?.telegram || customer?.phone || '-' }}
                        </p>
                    </div>

                    <div class="px-6 py-4 flex justify-end gap-3 border-t"
                        style="border-color:var(--border); background:var(--border-light);">
                        <button @click="closeAppointmentModal" class="px-5 py-2 rounded-lg text-sm font-medium"
                            :class="'text-[var(--text-2)]'">
                            {{ $t('Bekor qilish') }}
                        </button>
                        <button @click="sendAppointmentMessage" :disabled="appointmentSending" class="btn btn-primary">
                            <div v-if="appointmentSending"
                                class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70">
                            </div>
                            {{ $t('Yuborish') }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- To'lov havolasini yuborish modal -->
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="showPaymentLinkModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
                style="background:var(--overlay);" @click.self="closePaymentLinkModal">
                <div class="w-full max-w-md rounded-lg shadow-2xl overflow-hidden" :class="'bg-[var(--bg-card)]'">
                    <div class="px-6 py-4 flex items-center justify-between border-b"
                        style="border-color:var(--border);">
                        <h3 class="font-bold text-base" style="color:var(--text-1);">{{ $t("To'lov havolasini yuborish")
                        }}</h3>
                        <button @click="closePaymentLinkModal"
                            class="w-7 h-7 rounded-lg flex items-center justify-center"
                            style="background:var(--border-light); color:var(--text-2);">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                                stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="p-6 space-y-4">
                        <div v-if="paymentLinkError" class="text-xs text-[var(--danger)] px-1">{{ paymentLinkError }}
                        </div>
                        <div v-if="paymentLinkSent" class="text-xs text-[var(--success)] px-1">{{ $t('Xabar yuborildi')
                        }}</div>

                        <div class="rounded-xl px-4 py-3 flex items-center justify-between"
                            style="background:var(--danger-bg); border:1px solid var(--danger-border);">
                            <span class="text-xs font-medium text-[var(--danger)]">{{ $t('Qolgan qarz') }}</span>
                            <span class="text-sm font-bold text-[var(--danger)]">
                                {{ remainingDebt.toLocaleString() }} {{ $t("so'm") }}
                            </span>
                        </div>

                        <div class="space-y-1">
                            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-2)]">
                                {{ $t("To'lov havolasi (URL)") }}
                            </label>
                            <input type="text" v-model="paymentLinkUrl" @input="onPaymentLinkChange"
                                :placeholder="$t('https://...')"
                                class="w-full px-3 py-2.5 bg-[var(--border-light)] rounded-lg border text-sm transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
                                style="border-color:var(--border); color:var(--text-1);" />
                        </div>

                        <div class="space-y-1">
                            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-2)]">
                                {{ $t('Xabar matni') }}
                            </label>
                            <textarea v-model="paymentLinkMessage" rows="5"
                                class="w-full px-3 py-2.5 bg-[var(--border-light)] rounded-lg border text-sm transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
                                style="border-color:var(--border); color:var(--text-1);"></textarea>
                        </div>

                        <p class="text-xs" style="color:var(--text-3);">
                            {{ $t('Yuboriladi') }}: {{ customer?.telegram || customer?.phone || '-' }}
                        </p>
                    </div>

                    <div class="px-6 py-4 flex justify-end gap-3 border-t"
                        style="border-color:var(--border); background:var(--border-light);">
                        <button @click="closePaymentLinkModal" class="px-5 py-2 rounded-lg text-sm font-medium"
                            :class="'text-[var(--text-2)]'">
                            {{ $t('Bekor qilish') }}
                        </button>
                        <button @click="sendPaymentLinkMessage" :disabled="paymentLinkSending" class="btn btn-primary">
                            <div v-if="paymentLinkSending"
                                class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70">
                            </div>
                            {{ $t('Yuborish') }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- Telegram orqali xabar/fayl yuborish modal -->
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="showTelegramModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
                style="background:var(--overlay);" @click.self="closeTelegramModal">
                <div class="w-full max-w-md rounded-lg shadow-2xl overflow-hidden" :class="'bg-[var(--bg-card)]'">
                    <div class="px-6 py-4 flex items-center justify-between border-b"
                        style="border-color:var(--border);">
                        <h3 class="font-bold text-base" style="color:var(--text-1);">
                            {{ $t('Telegram orqali xabar/fayl yuborish') }}</h3>
                        <button @click="closeTelegramModal" class="w-7 h-7 rounded-lg flex items-center justify-center"
                            style="background:var(--border-light); color:var(--text-2);">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                                stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="p-6 space-y-4">
                        <div v-if="telegramError" class="text-xs text-[var(--danger)] px-1">{{ telegramError }}</div>
                        <div v-if="telegramSent" class="text-xs text-[var(--success)] px-1">{{ $t('Yuborildi') }}</div>

                        <div class="space-y-1">
                            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-2)]">
                                {{ $t('Xabar matni') }}
                            </label>
                            <textarea v-model="telegramMessage" rows="5" :placeholder="$t('Xabar matnini kiriting')"
                                class="w-full px-3 py-2.5 bg-[var(--border-light)] rounded-lg border text-sm transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
                                style="border-color:var(--border); color:var(--text-1);"></textarea>
                        </div>

                        <div class="space-y-1">
                            <label class="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-2)]">
                                {{ $t('Hujjat/fayl (ixtiyoriy)') }}
                            </label>
                            <label class="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm cursor-pointer"
                                style="border-color:var(--border); background:var(--border-light); color:var(--text-2);">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                                <span class="truncate">{{ telegramFile ? telegramFile.name : $t('Fayl tanlang')
                                }}</span>
                                <input type="file" class="hidden" @change="handleTelegramFileSelect" />
                            </label>
                            <button v-if="telegramFile" @click="telegramFile = null"
                                class="text-xs font-medium underline" style="color:var(--danger);">
                                {{ $t('Faylni olib tashlash') }}
                            </button>
                        </div>

                        <p class="text-xs" style="color:var(--text-3);">
                            {{ $t('Yuboriladi') }}: {{ customer?.telegram || customer?.phone || '-' }}
                        </p>
                    </div>

                    <div class="px-6 py-4 flex justify-end gap-3 border-t"
                        style="border-color:var(--border); background:var(--border-light);">
                        <button @click="closeTelegramModal" class="px-5 py-2 rounded-lg text-sm font-medium"
                            :class="'text-[var(--text-2)]'">
                            {{ $t('Bekor qilish') }}
                        </button>
                        <button @click="sendTelegramMessage" :disabled="telegramSending" class="btn btn-primary">
                            <div v-if="telegramSending"
                                class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70">
                            </div>
                            {{ $t('Yuborish') }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useLangStore } from '@/stores/lang'
import { useNavHistoryStore } from '@/stores/navHistory'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { ENDPOINTS, BASE_URL } from '@/api'
import ConsultationTimer from '@/components/customers/ConsultationTimer.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const langStore = useLangStore()
const navHistoryStore = useNavHistoryStore()

const customer = ref(null)
const payments = ref([])
const checks = ref([])
const documents = ref([])
const statusHistory = computed(() => customer.value?.statusHistory || [])
const loading = ref(false)
const statusSaving = ref(false)

const showDebtModal = ref(false)
const debtAmount = ref('')
const debtPaymentType = ref('NAQD')
const debtSaving = ref(false)
const debtError = ref('')

// Telegram orqali xabar/fayl yuborish modal
const showTelegramModal = ref(false)
const telegramMessage = ref('')
const telegramFile = ref(null)
const telegramSending = ref(false)
const telegramError = ref('')
const telegramSent = ref(false)

const openTelegramModal = () => {
    telegramMessage.value = ''
    telegramFile.value = null
    telegramError.value = ''
    telegramSent.value = false
    showTelegramModal.value = true
}

const closeTelegramModal = () => {
    showTelegramModal.value = false
    telegramMessage.value = ''
    telegramFile.value = null
    telegramError.value = ''
    telegramSent.value = false
}

const handleTelegramFileSelect = (e) => {
    telegramFile.value = e.target.files?.[0] || null
    e.target.value = ''
}

const sendTelegramMessage = async () => {
    telegramError.value = ''
    telegramSent.value = false

    if (!telegramMessage.value.trim() && !telegramFile.value) {
        telegramError.value = 'Xabar matni yoki fayl tanlang'
        return
    }

    const to = customer.value?.telegram || customer.value?.phone
    if (!to) {
        telegramError.value = 'Manzil topilmadi'
        return
    }

    telegramSending.value = true
    try {
        if (telegramFile.value) {
            const formData = new FormData()
            formData.append('to', to)
            formData.append('caption', telegramMessage.value)
            formData.append('file', telegramFile.value)
            await api.post(ENDPOINTS.TELEGRAM_SEND_FILE, formData)
        } else {
            await api.post(ENDPOINTS.TELEGRAM_SEND, { to, message: telegramMessage.value })
        }
        telegramSent.value = true
        telegramMessage.value = ''
        telegramFile.value = null
    } catch (e) {
        const msg = e?.response?.data?.message
        if (msg?.includes('ulanmagan') || msg?.includes('login')) {
            telegramError.value = 'Telegram ulanmagan. Sozlamalar sahifasida login qiling.'
        } else {
            telegramError.value = msg || 'Xabar yuborishda xatolik yuz berdi'
        }
    } finally {
        telegramSending.value = false
    }
}

// Qabul vaqtini belgilash modal
const showAppointmentModal = ref(false)
const appointmentDateTime = ref('')
const appointmentMessage = ref('')
const appointmentSending = ref(false)
const appointmentError = ref('')
const appointmentSent = ref(false)

const buildAppointmentMessage = (dateTimeStr) => {
    const name = `${customer.value?.surname || ''} ${customer.value?.name || ''}`.trim()
    if (!dateTimeStr) {
        return ``
    }
    const d = new Date(dateTimeStr)
    const pad = n => String(n).padStart(2, '0')
    const formatted = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    return `Hurmatli ${name}, sizning qabulingiz ${formatted} sanasiga belgilandi. Iltimos, belgilangan vaqtda tashrif buyurishingizni so'raymiz.\n\nYuridik Xizmatlar va Hujjatlar Tayyorlash Byurosi`
}

const openAppointmentModal = () => {
    appointmentDateTime.value = ''
    appointmentMessage.value = buildAppointmentMessage('')
    appointmentError.value = ''
    appointmentSent.value = false
    showAppointmentModal.value = true
}

const closeAppointmentModal = () => {
    showAppointmentModal.value = false
}

const onAppointmentDateChange = () => {
    appointmentMessage.value = buildAppointmentMessage(appointmentDateTime.value)
}

const sendAppointmentMessage = async () => {
    appointmentError.value = ''
    appointmentSent.value = false
    if (!appointmentMessage.value.trim()) {
        appointmentError.value = 'Xabar matnini kiriting'
        return
    }
    const to = customer.value?.telegram || customer.value?.phone
    if (!to) {
        appointmentError.value = 'Telegram yoki telefon raqami topilmadi'
        return
    }
    appointmentSending.value = true
    try {
        await api.post(ENDPOINTS.TELEGRAM_SEND, { to, message: appointmentMessage.value })
        appointmentSent.value = true
    } catch (e) {
        const msg = e?.response?.data?.message
        if (msg?.includes('ulanmagan') || msg?.includes('login')) {
            appointmentError.value = 'Telegram ulanmagan. Sozlamalar sahifasida login qiling.'
        } else {
            appointmentError.value = msg || 'Xabar yuborishda xatolik yuz berdi'
        }
    } finally {
        appointmentSending.value = false
    }
}

// To'lov havolasini yuborish modal
const showPaymentLinkModal = ref(false)
const paymentLinkUrl = ref('')
const paymentLinkMessage = ref('')
const paymentLinkSending = ref(false)
const paymentLinkError = ref('')
const paymentLinkSent = ref(false)

const buildPaymentLinkMessage = (url) => {
    const name = `${customer.value?.surname || ''} ${customer.value?.name || ''}`.trim()
    const debt = remainingDebt.value.toLocaleString()
    const linkLine = url ? `\n\nTo'lov havolasi: ${url}` : ''
    return `Hurmatli ${name}, sizning qolgan qarzingiz ${debt} so'm. Iltimos, to'lovni amalga oshiring.${linkLine}\n\nYuridik Xizmatlar va Hujjatlar Tayyorlash Byurosi`
}

const openPaymentLinkModal = () => {
    paymentLinkUrl.value = ''
    paymentLinkMessage.value = buildPaymentLinkMessage('')
    paymentLinkError.value = ''
    paymentLinkSent.value = false
    showPaymentLinkModal.value = true
}

const closePaymentLinkModal = () => {
    showPaymentLinkModal.value = false
}

const onPaymentLinkChange = () => {
    paymentLinkMessage.value = buildPaymentLinkMessage(paymentLinkUrl.value.trim())
}

const sendPaymentLinkMessage = async () => {
    paymentLinkError.value = ''
    paymentLinkSent.value = false
    if (!paymentLinkMessage.value.trim()) {
        paymentLinkError.value = 'Xabar matnini kiriting'
        return
    }
    const to = customer.value?.telegram || customer.value?.phone
    if (!to) {
        paymentLinkError.value = 'Telegram yoki telefon raqami topilmadi'
        return
    }
    paymentLinkSending.value = true
    try {
        await api.post(ENDPOINTS.TELEGRAM_SEND, { to, message: paymentLinkMessage.value })
        paymentLinkSent.value = true
    } catch (e) {
        const msg = e?.response?.data?.message
        if (msg?.includes('ulanmagan') || msg?.includes('login')) {
            paymentLinkError.value = 'Telegram ulanmagan. Sozlamalar sahifasida login qiling.'
        } else {
            paymentLinkError.value = msg || 'Xabar yuborishda xatolik yuz berdi'
        }
    } finally {
        paymentLinkSending.value = false
    }
}

const paymentOptions = [
    { value: 'NAQD', label: 'Naqd pul' },
    { value: 'KARTA', label: 'Plastik karta' },
    { value: 'ONLINE', label: "Online to'lov" },
    { value: 'BANK_TRANSFER', label: "Bank o'tkazmasi" },
]

const handleDebtAmountInput = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    debtAmount.value = raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const closeDebtModal = () => {
    showDebtModal.value = false
    debtAmount.value = ''
    debtPaymentType.value = 'NAQD'
    debtError.value = ''
}

const payDebt = async () => {
    debtError.value = ''
    const amountRaw = Number(String(debtAmount.value).replace(/\./g, ''))
    if (!amountRaw || amountRaw <= 0) {
        debtError.value = "To'lov miqdorini kiriting"
        return
    }
    if (amountRaw > remainingDebt.value) {
        debtError.value = `Qarzdan ko'p kiritildi. Maksimal: ${remainingDebt.value.toLocaleString()} so'm`
        return
    }
    debtSaving.value = true
    try {
        await api.put(ENDPOINTS.CUSTOMER(customer.value.id), {
            paymentAmount: amountRaw,
            paymentType: debtPaymentType.value,
        })
        await fetchCustomerData()
        closeDebtModal()
    } catch (e) {
        debtError.value = "Xatolik yuz berdi"
    } finally {
        debtSaving.value = false
    }
}

const statusLabels = computed(() => ({
    NAVBATDA: langStore.t('Navbatda'),
    KORIB_CHIQILDI: langStore.t("Qabulga kiritildi"),
    YAKUNLANDI: langStore.t('Maslahat berildi'),
    YURISTDA: langStore.t('Maslahat berildi va shartnoma tuzildi'),
    BEKOR_QILINDI: langStore.t('Rad etildi'),
}))

const statusInlineColors = {
    NAVBATDA: { bg: 'var(--border-light)', color: 'var(--text-2)' },
    YURISTDA: { bg: 'var(--success-bg)', color: 'var(--success)' },
    KORIB_CHIQILDI: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
    JARAYONDA: { bg: 'var(--primary-light)', color: 'var(--text-1)' },
    YAKUNLANDI: { bg: 'var(--success-bg)', color: 'var(--success)' },
    BEKOR_QILINDI: { bg: 'var(--danger-bg)', color: 'var(--danger)' },
}

// Konsultatsiya taymeri faqat YURIST va RAHBAR uchun ko'rinadi
const canSeeTimer = computed(() => ['YURIST', 'RAHBAR'].includes(authStore.user?.role))

// Qora ro'yxatga qo'shish/olib tashlash — faqat YURIST, RAHBAR, ADMIN
const canManageBlacklist = computed(() => ['YURIST', 'RAHBAR', 'ADMIN'].includes(authStore.user?.role))

const showBlacklistModal = ref(false)
const blacklistReason = ref('')
const blacklistSaving = ref(false)
const blacklistError = ref('')

const openBlacklistModal = () => {
    blacklistReason.value = ''
    blacklistError.value = ''
    showBlacklistModal.value = true
}

const closeBlacklistModal = () => {
    showBlacklistModal.value = false
    blacklistReason.value = ''
    blacklistError.value = ''
}

const submitBlacklist = async () => {
    blacklistError.value = ''
    if (!blacklistReason.value.trim()) {
        blacklistError.value = 'Sababni kiriting'
        return
    }
    blacklistSaving.value = true
    try {
        const { data } = await api.put(ENDPOINTS.CUSTOMER_BLACKLIST(customer.value.id), { reason: blacklistReason.value.trim() })
        customer.value = { ...customer.value, ...data }
        closeBlacklistModal()
    } catch (e) {
        blacklistError.value = e?.response?.data?.message || 'Xatolik yuz berdi'
    } finally {
        blacklistSaving.value = false
    }
}

const removeFromBlacklist = async () => {
    blacklistSaving.value = true
    try {
        const { data } = await api.put(ENDPOINTS.CUSTOMER_UNBLACKLIST(customer.value.id))
        customer.value = { ...customer.value, ...data }
    } finally {
        blacklistSaving.value = false
    }
}

const changeStatus = async (newStatus) => {
    if (!customer.value || statusSaving.value) return
    statusSaving.value = true
    try {
        const { data } = await api.put(ENDPOINTS.CUSTOMER(customer.value.id), { status: newStatus })
        // To'liq javobni merge qilamiz — consultationSeconds ham darhol yangilanadi
        customer.value = { ...customer.value, ...data }
    } finally {
        statusSaving.value = false
    }
}

const onStatusSelect = (newStatus) => {
    if (newStatus === 'BEKOR_QILINDI') {
        openRejectModal()
        return
    }
    changeStatus(newStatus)
}

const showRejectModal = ref(false)
const rejectReason = ref('')
const rejectSaving = ref(false)
const rejectError = ref('')

const openRejectModal = () => {
    rejectReason.value = ''
    rejectError.value = ''
    showRejectModal.value = true
}

const closeRejectModal = () => {
    showRejectModal.value = false
    rejectReason.value = ''
    rejectError.value = ''
}

const submitReject = async () => {
    rejectError.value = ''
    if (!rejectReason.value.trim()) {
        rejectError.value = 'Sababni kiriting'
        return
    }
    rejectSaving.value = true
    try {
        const { data } = await api.put(ENDPOINTS.CUSTOMER_REJECT(customer.value.id), { reason: rejectReason.value.trim() })
        customer.value = { ...customer.value, ...data }
        closeRejectModal()
    } catch (e) {
        rejectError.value = e?.response?.data?.message || 'Xatolik yuz berdi'
    } finally {
        rejectSaving.value = false
    }
}

const totalPaid = computed(() =>
    payments.value.reduce((sum, p) => sum + Number(p.amount || 0), 0)
)

const remainingDebt = computed(() => {
    const price = Number(customer.value?.price || 0)
    return Math.max(0, price - totalPaid.value)
})

const fetchCustomerData = async () => {
    const id = route.params.id
    if (!id) return
    loading.value = true
    try {
        const [{ data: cust }, { data: ch }, { data: docs }] = await Promise.all([
            api.get(ENDPOINTS.CUSTOMER(id)),
            api.get(`${ENDPOINTS.CUSTOMER(id)}/checks`),
            api.get(ENDPOINTS.CUSTOMER_DOCUMENTS(id)),
        ])
        customer.value = cust
        payments.value = cust.payments || []
        checks.value = ch
        documents.value = docs
    } catch (error) {
        console.error('Xatolik:', error)
        alert("Ma'lumotlarni yuklashda xatolik yuz berdi")
    } finally {
        loading.value = false
    }
}

onMounted(fetchCustomerData)

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    const pad = n => String(n).padStart(2, '0')
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const isImage = (url) => /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
const isPDF = (url) => /\.pdf$/i.test(url)

const printQabulxat = () => {
    const c = customer.value
    if (!c) return
    const params = new URLSearchParams({
        fish: `${c.surname || ''} ${c.name || ''}`.trim(),
        telefon: c.phone || '',
        manzil: c.address || '',
        id: `MJZ-${c.customer_id || ''}`,
        raqam: c.queueNumber ? `A-${String(c.queueNumber).padStart(2, '0')}` : '—',
        yurist: c.assignedTo ? `${c.assignedTo.surname} ${c.assignedTo.name}` : '—',
        sana: (c.createdAt ? new Date(c.createdAt) : new Date()).getTime().toString(),
    })
    window.open(`/qabulxati.html?${params.toString()}`, '_blank')
}

const printChek = () => {
    const c = customer.value
    if (!c) return
    const w = window.open('about:blank', '_blank')
    const today = new Date()
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`
    const fullName = `${c.surname || ''} ${c.name || ''}`.trim()
    const queueNumber = c.queueNumber ? String(c.queueNumber).padStart(2, '0') : '--'
    w.document.write(`<!DOCTYPE html><html><head><title>Chek</title><style>
    @page{size:80mm auto;margin:0}*{box-sizing:border-box}
    body{width:80mm;margin:0;padding:10mm 5mm;font-family:"Courier New",monospace;color:#000;font-size:12px}
    .center{text-align:center}.company{font-size:13px;font-weight:bold;text-transform:uppercase;margin-bottom:2px}
    .subtitle{font-size:11px;margin-bottom:10px}.divider{border-top:1px dashed #000;margin:8px 0}
    .info-row{display:flex;justify-content:space-between;margin:4px 0}.label{font-weight:bold}
    .client-name{text-align:center;font-size:15px;font-weight:bold;margin:10px 0;word-break:break-word}
    .queue-box{border:2px solid #000;text-align:center;padding:10px 0;margin:10px 0}
    .queue-number{font-size:42px;font-weight:bold;line-height:1}
    .queue-text{font-size:12px;margin-top:5px;font-weight:bold}
    .notice{text-align:center;font-size:11px;margin-top:10px;line-height:1.5}
    .footer{text-align:center;margin-top:12px;font-size:10px}
  </style></head><body>
    <div class="center"><div class="company">Yuridik Xizmatlar va Hujjatlar Tayyorlash Byurosi</div><div class="subtitle">QABUL CHEKI</div></div>
    <div class="divider"></div>
    <div class="info-row"><span class="label">Sana:</span><span>${formattedDate}</span></div>
    <div class="info-row"><span class="label">ID:</span><span>MJZ-${c.customer_id || ''}</span></div>
    <div class="divider"></div>
    <div class="center"><div class="label">MIJOZ</div><div class="client-name">${fullName}</div></div>
    <div class="divider"></div>
    <div class="queue-box"><div class="queue-number">A-${queueNumber}</div><div class="queue-text">NAVBAT RAQAMI</div></div>
    <div class="divider"></div>
    <div class="notice"><b>Eslatma</b><br>Ushbu chekni saqlab qo'ying.<br>Navbatni tekshirish uchun ID raqamdan foydalaning.</div>
    <div class="divider"></div>
    <div class="footer"><br><br>Tashrifingiz uchun rahmat!</div>
  </body></html>`)
    w.document.close()
    setTimeout(() => { w.focus(); w.print() }, 400)
}

const openCheck = (check) => {
    const filterUrl = (url) => {
        if (!url) return url
        return url.replace(/^\/*uploads\//i, '/').replace(/^uploads\//i, '/')
    }
    window.location.href = `${BASE_URL}/${filterUrl(check.check_url)}`
}

const documentUploadError = ref('')

const handleUploadDocuments = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return

    documentUploadError.value = ''
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    try {
        const { data } = await api.post(ENDPOINTS.CUSTOMER_DOCUMENTS(customer.value.id), formData)
        documents.value = data
    } catch (err) {
        documentUploadError.value = err?.response?.data?.message || "Hujjatlarni yuklashda xatolik yuz berdi"
    }
}

const openDocument = (doc) => {
    const filterUrl = (url) => {
        if (!url) return url
        return url.replace(/^\/*uploads\//i, '/').replace(/^uploads\//i, '/')
    }
    window.open(`${BASE_URL}/${filterUrl(doc.url)}`, '_blank')
}

const goBack = () => {
    if (navHistoryStore.canGoBack) router.back()
    else router.push('/customers')
}
</script>

<script>
// InfoRow inline component
import { defineComponent, h } from 'vue'
import { useThemeStore } from '@/stores/theme'

export default defineComponent({
    components: {
        InfoRow: defineComponent({
            props: ['label', 'value', 'icon', 'highlight'],
            setup(props) {
                const themeStore = useThemeStore()
                const icons = {
                    user: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
                    phone: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z',
                    location: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
                    money: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
                }
                return () => h('div', { class: 'flex flex-col gap-1' }, [
                    h('p', { class: 'text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider' }, props.label),
                    h('p', {
                        class: `text-sm font-semibold ${props.highlight
                            ? 'text-[var(--success)]'
                            : 'text-[var(--text-1)]'}`
                    }, props.value || '-')
                ])
            }
        })
    }
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.slide-fade-enter-active {
    transition: opacity 0.18s ease-out, transform 0.18s ease-out;
}
.slide-fade-leave-active {
    transition: opacity 0.12s ease-in, transform 0.12s ease-in;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--bg-card);
    cursor: pointer;
    text-align: left;
    transition: border-color 150ms ease, background 150ms ease;
}
.action-btn:hover {
    border-color: var(--text-3);
    background: var(--border-light);
}
.action-icon {
    width: 30px;
    height: 30px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.action-label {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-1);
    line-height: 1.25;
}
</style>
