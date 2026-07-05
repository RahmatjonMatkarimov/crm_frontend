<template>
    <div class="min-h-screen py-8 px-4">
        <div class="max-w-5xl mx-auto">

            <!-- Loading -->
            <div v-if="loading" class="flex flex-col items-center justify-center py-32 gap-3">
                <div class="w-8 h-8 border-2 rounded-full animate-spin" style="border-color:var(--border); border-top-color:var(--primary);"></div>
                <p class="text-[var(--text-2)] text-sm">{{ $t("Ma'lumotlar yuklanmoqda...") }}</p>
            </div>

            <!-- Not found -->
            <div v-else-if="!customer"
                class="p-8 rounded-xl text-center"
                style="background:var(--danger-bg); border:1px solid var(--danger-border);">
                <p class="text-lg font-medium" style="color:var(--danger);">{{ $t('Mijoz topilmadi') }}</p>
            </div>

            <div v-else class="space-y-5">

                <!-- Hero Header -->
                <div class="overflow-hidden card">
                    <div class="px-6 py-5 flex items-center justify-between gap-4">
                        <div class="flex items-center gap-5">
                            <div class="w-16 h-16 rounded-lg flex items-center justify-center shrink-0 text-2xl font-bold text-white"
                                style="background:linear-gradient(135deg,var(--primary),var(--primary-hover));">
                                {{ (customer.surname || customer.name || '?').charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <h1 class="text-xl font-bold leading-tight" style="color:var(--text-1);">
                                    {{ $t(customer.surname) }} {{ $t(customer.name) }} {{ $t(customer.father_name || '') }}
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
                                    <span v-if="customer.customer_id" class="text-xs" style="color:var(--text-3);">•</span>
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
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            {{ $t('Orqaga') }}
                        </button>
                    </div>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    <!-- Main Info Card -->
                    <div class="lg:col-span-2 rounded-xl border shadow-sm overflow-hidden"
                        :class="'bg-[var(--bg-card)] border-[var(--border)]'">
                        <div class="px-6 py-4 border-b"
                            :class="'border-[var(--border)] bg-[var(--border-light)]'">
                            <p class="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-2)]">
                                {{ $t('Mijoz haqida') }}
                            </p>
                        </div>
                        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoRow :label="$t('F.I.Sh')"
                                :value="`${$t(customer.surname || '')} ${$t(customer.name || '')} ${$t(customer.father_name || '')}`" icon="user" />
                            <InfoRow :label="$t('Telefon raqam')" :value="customer.phone || '-'" icon="phone" />
                            <div class="flex flex-col gap-1">
                                <p class="text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider">{{ $t('Telegram') }}</p>
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
                        <div v-if="authStore.userRole === 'YURIST'"
                            class="px-6 pb-6">
                            <div class="rounded-lg p-4"
                                :class="'bg-[var(--border-light)] border border-[var(--border)]'">
                                <p class="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-2)] mb-2">
                                    {{ $t('Izoh / Tavsif') }}
                                </p>
                                <p class="text-sm whitespace-pre-wrap"
                                    :class="themeStore.isDark ? 'text-[var(--text-2)]' : 'text-[var(--text-1)]'">
                                    {{ $t(customer.description) || $t("Izoh yo'q") }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Meta Card -->
                    <div class="rounded-xl border shadow-sm overflow-hidden"
                        :class="'bg-[var(--bg-card)] border-[var(--border)]'">
                        <div class="px-6 py-4 border-b"
                            :class="'border-[var(--border)] bg-[var(--border-light)]'">
                            <p class="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-2)]">
                                {{ $t("Qo'shimcha") }}
                            </p>
                        </div>
                        <div class="p-6 space-y-5">
                            <!-- Status -->
                            <div>
                                <p class="text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider mb-2">
                                    {{ $t('Ish jarayoni') }}
                                </p>
                                <div class="relative">
                                    <select
                                        :value="customer.status || 'NAVBATDA'"
                                        @change="changeStatus($event.target.value)"
                                        :disabled="statusSaving"
                                        class="w-full pl-3 pr-8 py-2 rounded-xl text-sm font-semibold transition-all focus:outline-none appearance-none cursor-pointer disabled:opacity-60"
                                        :style="`background:${statusInlineColors[customer.status || 'NAVBATDA']?.bg}; color:${statusInlineColors[customer.status || 'NAVBATDA']?.color}; border:1.5px solid ${statusInlineColors[customer.status || 'NAVBATDA']?.color}40;`"
                                    >
                                        <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
                                    </select>
                                    <svg v-if="!statusSaving" class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        :style="`color:${statusInlineColors[customer.status || 'NAVBATDA']?.color}`">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                                    </svg>
                                    <div v-else class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
                                        :style="`color:${statusInlineColors[customer.status || 'NAVBATDA']?.color}`"></div>
                                </div>
                            </div>

                            <!-- Konsultatsiya vaqti (faqat YURIST va RAHBAR) -->
                            <div v-if="canSeeTimer && (customer.calledAt || customer.consultationSeconds != null)">
                                <p class="text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider mb-1">
                                    {{ $t('Konsultatsiya vaqti') }}
                                </p>
                                <ConsultationTimer :called-at="customer.calledAt" :seconds="customer.consultationSeconds" />
                            </div>

                            <div>
                                <p class="text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider mb-1">
                                    {{ $t('Yaratilgan sana') }}
                                </p>
                                <p class="text-sm font-semibold"
                                    :class="'text-[var(--text-1)]'">
                                    {{ formatDate(customer.createdAt) }}
                                </p>
                            </div>
                            <div v-if="customer.assignedTo">
                                <p class="text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider mb-1">
                                    {{ $t("Mas'ul") }}
                                </p>
                                <div class="flex items-center gap-2">
                                    <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                                        style="background:linear-gradient(135deg,var(--primary),var(--primary-hover));">
                                        {{ (customer.assignedTo.name || '?').charAt(0).toUpperCase() }}
                                    </div>
                                    <p class="text-sm font-semibold"
                                        :class="'text-[var(--text-1)]'">
                                        {{ $t(customer.assignedTo.name) }} {{ $t(customer.assignedTo.surname) }}
                                    </p>
                                </div>
                            </div>

                            <!-- Payment summary -->
                            <div class="pt-4 border-t"
                                :class="'border-[var(--border)]'">
                                <p class="text-[11px] font-medium text-[var(--text-2)] uppercase tracking-wider mb-3">
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
                                    <div v-if="remainingDebt > 0" class="rounded-xl px-4 py-3 flex items-center justify-between"
                                        style="background:var(--danger-bg); border:1px solid var(--danger-border);">
                                        <span class="text-xs text-[var(--danger)] font-medium">
                                            {{ $t('Qarz') }}
                                        </span>
                                        <span class="text-sm font-bold text-[var(--danger)]">
                                            {{ remainingDebt.toLocaleString() }} {{ $t("so'm") }}
                                        </span>
                                    </div>
                                    <button v-if="remainingDebt > 0"
                                        @click="showDebtModal = true"
                                        class="btn btn-primary w-full mt-1 justify-center">
                                        {{ $t("Qarz to'lash") }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment History -->
                <div class="rounded-xl border shadow-sm overflow-hidden"
                    :class="'bg-[var(--bg-card)] border-[var(--border)]'">
                    <div class="px-6 py-4 border-b flex items-center justify-between"
                        :class="'border-[var(--border)] bg-[var(--border-light)]'">
                        <p class="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-2)]">
                            {{ $t("To'lov Tarixi") }}
                        </p>
                        <span class="text-xs font-medium px-2.5 py-1 rounded-lg"
                            :class="'bg-[var(--border-light)] text-[var(--text-2)]'">
                            {{ payments.length }} {{ $t('ta') }}
                        </span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr :class="'border-b border-[var(--border)]'">
                                    <th class="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-2)]">
                                        {{ $t('Sana') }}
                                    </th>
                                    <th class="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-2)]">
                                        {{ $t('Summa') }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y"
                                :class="'divide-[var(--border)]'">
                                <tr v-for="payment in payments" :key="payment.id"
                                    class="transition-colors"
                                    :class="'hover:bg-[var(--border-light)]'">
                                    <td class="px-6 py-4 text-sm"
                                        :class="themeStore.isDark ? 'text-[var(--text-2)]' : 'text-[var(--text-3)]'">
                                        {{ formatDate(payment.createdAt) }}
                                    </td>
                                    <td class="px-6 py-4">
                                        <span
                                            class="inline-flex items-center gap-1 text-sm font-semibold text-[var(--success)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
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
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                    stroke-width="1.5" stroke="currentColor"
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

                <!-- Checks -->
                <div class="rounded-xl border shadow-sm overflow-hidden"
                    :class="'bg-[var(--bg-card)] border-[var(--border)]'">
                    <div class="px-6 py-4 border-b flex items-center justify-between"
                        :class="'border-[var(--border)] bg-[var(--border-light)]'">
                        <p class="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-2)]">
                            {{ $t('Cheklar') }}
                        </p>
                        <span class="text-xs font-medium px-2.5 py-1 rounded-lg"
                            :class="'bg-[var(--border-light)] text-[var(--text-2)]'">
                            {{ checks.length }} {{ $t('ta') }}
                        </span>
                    </div>

                    <div v-if="checks.length > 0" class="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div v-for="check in checks" :key="check.id"
                            @click="openCheck(check)"
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
                                <p class="text-xs font-medium mt-1.5 flex items-center gap-1" style="color:var(--primary);">
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
                                    stroke-width="1.5" stroke="currentColor" class="w-7 h-7 text-[var(--text-2)]">
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
                <div class="rounded-xl border shadow-sm overflow-hidden"
                    :class="'bg-[var(--bg-card)] border-[var(--border)]'">
                    <div class="px-6 py-4 border-b flex items-center justify-between"
                        :class="'border-[var(--border)] bg-[var(--border-light)]'">
                        <p class="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-2)]">
                            {{ $t('Hujjatlar') }}
                        </p>
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-medium px-2.5 py-1 rounded-lg"
                                :class="'bg-[var(--border-light)] text-[var(--text-2)]'">
                                {{ documents.length }} {{ $t('ta') }}
                            </span>
                            <label class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all"
                                style="background:var(--primary-light); color:var(--primary);">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                                {{ $t('Fayl yuklash') }}
                                <input type="file" multiple class="hidden" @change="handleUploadDocuments" />
                            </label>
                        </div>
                    </div>
                    <p v-if="documentUploadError" class="px-6 pt-3 text-xs" style="color:var(--danger);">
                        {{ documentUploadError }}
                    </p>

                    <div v-if="documents.length > 0" class="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div v-for="doc in documents" :key="doc.id"
                            @click="openDocument(doc)"
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
                                <p class="text-xs truncate" style="color:var(--text-1);" :title="doc.originalName">
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
                                    stroke-width="1.5" stroke="currentColor" class="w-7 h-7 text-[var(--text-2)]">
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
        </div>
    </div>

    <!-- Qarz to'lash modal -->
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="showDebtModal"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                style="background:var(--overlay);"
                @click.self="closeDebtModal">
                <div class="w-full max-w-sm rounded-lg shadow-2xl overflow-hidden"
                    :class="'bg-[var(--bg-card)]'">
                    <!-- Header -->
                    <div class="px-6 py-4 flex items-center justify-between border-b" style="border-color:var(--border);">
                        <h3 class="font-bold text-base" style="color:var(--text-1);">{{ $t("Qarz to'lash") }}</h3>
                        <button @click="closeDebtModal"
                            class="w-7 h-7 rounded-lg flex items-center justify-center"
                            style="background:var(--border-light); color:var(--text-2);">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
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
                            <input
                                :value="debtAmount"
                                @input="handleDebtAmountInput"
                                type="text"
                                inputmode="numeric"
                                :placeholder="$t('Miqdorni kiriting')"
                                class="w-full px-3 py-2.5 bg-[var(--border-light)] rounded-lg border text-sm transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
                                style="border-color:var(--border); color:var(--text-1);"
                            />
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
                        <button @click="closeDebtModal"
                            class="px-5 py-2 rounded-lg text-sm font-medium"
                            :class="'text-[var(--text-2)]'">
                            {{ $t('Bekor qilish') }}
                        </button>
                        <button @click="payDebt" :disabled="debtSaving" class="btn btn-primary">
                            <div v-if="debtSaving" class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70"></div>
                            {{ $t("To'lash") }}
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
const loading = ref(false)
const statusSaving = ref(false)

const showDebtModal = ref(false)
const debtAmount = ref('')
const debtPaymentType = ref('NAQD')
const debtSaving = ref(false)
const debtError = ref('')

// Telegram modal
const showTelegramModal = ref(false)
const telegramMessage = ref('')
const telegramTarget = ref('username')
const telegramSending = ref(false)
const telegramError = ref('')
const telegramSent = ref(false)

const openTelegramModal = () => {
    telegramTarget.value = customer.value?.telegram ? 'username' : 'phone'
    telegramMessage.value = ''
    telegramError.value = ''
    telegramSent.value = false
    showTelegramModal.value = true
}

const closeTelegramModal = () => {
    showTelegramModal.value = false
    telegramMessage.value = ''
    telegramError.value = ''
    telegramSent.value = false
}

const sendTelegramMessage = async () => {
    telegramError.value = ''
    telegramSent.value = false
    if (!telegramMessage.value.trim()) return

    const to = telegramTarget.value === 'username'
        ? customer.value?.telegram
        : customer.value?.phone

    if (!to) {
        telegramError.value = 'Manzil topilmadi'
        return
    }

    telegramSending.value = true
    try {
        await api.post('/api/telegram/send', { to, message: telegramMessage.value })
        telegramSent.value = true
        telegramMessage.value = ''
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
</style>
