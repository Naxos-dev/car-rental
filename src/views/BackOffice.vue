<template>
  <div class="backoffice">
    <div class="container">
      <h1 class="page-title">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
          />
        </svg>
        {{ t("backoffice.title") }}
      </h1>

      <!-- Onglets -->
      <div class="tabs">
        <button
          :class="['tab', { active: activeTab === 'reservations' }]"
          @click="activeTab = 'reservations'"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 11l3 3L22 4" />
            <path
              d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
            />
          </svg>
          {{ t("backoffice.tabReservations") }}
        </button>
        <button
          :class="['tab', { active: activeTab === 'vehicles' }]"
          @click="activeTab = 'vehicles'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.5-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"
            />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
          </svg>
          {{ t("backoffice.tabVehicles") }}
        </button>
      </div>

      <!-- ════════════ TAB RÉSERVATIONS ════════════ -->
      <div v-if="activeTab === 'reservations'">
        <!-- ════════════ RÉSERVATION EN AGENCE ════════════ -->
        <section class="form-section agency-booking">
          <button
            class="agency-booking-toggle"
            type="button"
            @click="showAgencyBooking = !showAgencyBooking"
            :aria-expanded="showAgencyBooking"
            aria-controls="agency-booking-form"
          >
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              {{ t("backoffice.agencyBooking") }}
              <span class="badge-agency">{{ t("backoffice.walkIn") }}</span>
            </h2>
            <svg class="chevron" :class="{ open: showAgencyBooking }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <form v-if="showAgencyBooking" id="agency-booking-form" class="vehicle-form agency-form" @submit.prevent="handleAgencyBooking">
            <!-- Étape 1 : lieu de prise en charge (détermine les véhicules disponibles à cet endroit) -->
            <div class="field">
              <label for="ab-location">{{ t("booking.location") }}</label>
              <select id="ab-location" v-model="agencyForm.location" required>
                <option value="" disabled>{{ t("backoffice.locationSelectPlaceholder") }}</option>
                <option v-for="loc in locationStore.locations" :key="loc.id" :value="loc.nom">{{ loc.nom }}</option>
              </select>
            </div>

            <!-- Étape 2 : période (affichée seulement quand un lieu est choisi) -->
            <template v-if="agencyForm.location">
              <div class="field">
                <label>{{ t("booking.dateRange") }}</label>
                <DateRangePicker
                  :startDate="agencyForm.startDate"
                  :endDate="agencyForm.endDate"
                  :disabledRanges="[]"
                  :placeholder="t('booking.selectDates')"
                  @update:startDate="agencyForm.startDate = $event"
                  @update:endDate="agencyForm.endDate = $event"
                />
              </div>
              <div class="field-row">
                <div class="field">
                  <label for="ab-start-time">{{ t("booking.startTime") }}</label>
                  <input id="ab-start-time" v-model="agencyForm.startTime" type="time" required :lang="timeLang" />
                </div>
                <div class="field">
                  <label for="ab-end-time">{{ t("booking.endTime") }}</label>
                  <input id="ab-end-time" v-model="agencyForm.endTime" type="time" required :lang="timeLang" />
                </div>
              </div>

              <!-- Étape 3 : véhicule (affiché seulement quand les dates sont renseignées ; filtré par lieu + disponibilité) -->
              <template v-if="agencyForm.startDate && agencyForm.endDate">
                <div v-if="availableVehicles.length === 0" class="no-vehicles-notice">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {{ t("backoffice.noVehiclesAvailable") }}
                </div>
                <div class="field" v-else>
                  <label for="ab-vehicle">{{ t("backoffice.available") }}</label>
                  <select id="ab-vehicle" v-model="agencyForm.vehicleId" required>
                    <option value="" disabled>{{ t("backoffice.vehicleSelectPlaceholder") }}</option>
                    <option v-for="v in availableVehicles" :key="v.id" :value="v.id">
                      {{ v.marque }} {{ v.modele }} — {{ v.prix }}€/j
                    </option>
                  </select>
                </div>

                <!-- Étape 4 : infos client (affiché seulement quand un véhicule est choisi) -->
                <template v-if="agencyForm.vehicleId">
                  <div class="field-row">
                    <div class="field">
                      <label for="ab-nom">{{ t("backoffice.clientName") }}</label>
                      <input id="ab-nom" v-model="agencyForm.nom" type="text" :placeholder="t('backoffice.clientNamePlaceholder')" required />
                    </div>
                    <div class="field">
                      <label for="ab-email">{{ t("modal.email") }}</label>
                      <input id="ab-email" v-model="agencyForm.email" type="email" :placeholder="t('backoffice.clientEmailPlaceholder')" required />
                    </div>
                    <div class="field">
                      <label for="ab-tel">{{ t("modal.phone") }}</label>
                      <input id="ab-tel" v-model="agencyForm.telephone" type="tel" :placeholder="t('backoffice.clientPhonePlaceholder')" required />
                    </div>
                  </div>

                  <p v-if="agencyBookingError" class="form-error" role="alert">{{ agencyBookingError }}</p>

                  <div class="form-actions">
                    <button type="button" class="btn-cancel" @click="showAgencyBooking = false">{{ t("searchBanner.cancel") }}</button>
                    <button type="submit" class="btn-submit" :disabled="agencyBookingSaving">
                      <svg v-if="agencyBookingSaving" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-spin">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                      <span>{{ agencyBookingSaving ? t("backoffice.agencySaving") : t("backoffice.agencyConfirm") }}</span>
                    </button>
                  </div>
                </template>
              </template>
            </template>
          </form>
        </section>

        <!-- Toggle liste / calendrier -->
        <div class="view-toggle">
          <button
            :class="['vt-btn', { active: reservationsView === 'list' }]"
            @click="reservationsView = 'list'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="inline-icon"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            {{ t("backoffice.viewList") }}
          </button>
          <button
            :class="['vt-btn', { active: reservationsView === 'calendar' }]"
            @click="reservationsView = 'calendar'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="inline-icon"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {{ t("backoffice.viewCalendar") }}
          </button>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-num">{{ reservations.length }}</span
            ><span class="stat-label">{{ t("backoffice.statTotal") }}</span>
          </div>
          <div class="stat-card stat-card--green">
            <span class="stat-num">{{ confirmedCount }}</span
            ><span class="stat-label">{{ t("backoffice.statConfirmed") }}</span>
          </div>
          <div class="stat-card stat-card--red">
            <span class="stat-num">{{ cancelledCount }}</span
            ><span class="stat-label">{{ t("backoffice.statCancelled") }}</span>
          </div>
        </div>

        <section class="list-section" v-if="reservationsView === 'list'">
          <h2>
            {{ t("backoffice.reservationsTitle") }} <span class="badge">{{ reservations.length }}</span>
          </h2>
          <div v-if="reservationStore.loading" class="empty-state">
            {{ t("backoffice.loading") }}
          </div>
          <div v-else-if="reservations.length === 0" class="empty-state">
            {{ t("backoffice.noReservations") }}
          </div>
          <div class="vehicles-table-wrapper" v-else>
            <table class="vehicles-table">
              <thead>
                <tr>
                  <th>{{ t("backoffice.colDate") }}</th>
                  <th>{{ t("backoffice.colClient") }}</th>
                  <th>{{ t("backoffice.colVehicle") }}</th>
                  <th>{{ t("backoffice.colPeriod") }}</th>
                  <th>{{ t("backoffice.colStatus") }}</th>
                  <th class="th-center">{{ t("backoffice.colDetail") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in paginatedReservations"
                  :key="r.id"
                  :class="`row--${r.statut}`"
                >
                  <td class="date-col">{{ formatDate(r.createdAt) }}</td>
                  <td>
                    <strong>{{ r.nom }}</strong
                    ><br />
                    <a :href="`mailto:${r.email}`" class="client-email">{{
                      r.email
                    }}</a
                    ><br />
                    <span class="client-phone">{{ r.telephone }}</span>
                  </td>
                  <td>{{ r.vehicleLabel }}</td>
                  <td>
                    <span class="location-label">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="inline-icon"
                      >
                        <path
                          d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                        />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {{ r.location }}</span
                    ><br />
                    <span class="date-range"
                      >{{ formatDate(r.startDate) }} {{ r.startTime }} → {{ formatDate(r.endDate) }}
                      {{ r.endTime }}</span
                    >
                  </td>
                  <td>
                    <select
                      :value="r.statut"
                      :class="['statut-select', `statut--${r.statut}`]"
                      @change="
                        reservationStore.updateStatut(r.id, $event.target.value)
                      "
                    >
                      <option value="confirmee">{{ t("backoffice.statusConfirmed") }}</option>
                      <option value="annulee">{{ t("backoffice.statusCancelled") }}</option>
                    </select>
                  </td>
                  <td class="td-center">
                    <button
                      class="btn-detail"
                      @click="openDetail(r)"
                      :title="t('backoffice.viewDetail')"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path
                          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                        />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="totalPages > 1" class="pagination">
            <button
              class="btn-page"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >{{ t("backoffice.prev") }}</button>
            <span class="page-info">{{ t("backoffice.page") }} {{ currentPage }} {{ t("backoffice.of") }} {{ totalPages }}</span>
            <button
              class="btn-page"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >{{ t("backoffice.next") }}</button>
          </div>
        </section>

        <!-- Vue calendrier -->
        <div v-if="reservationsView === 'calendar'" class="calendar-wrapper">
          <div class="calendar-legend">
            <span class="legend-dot" style="background: #22c55e"></span>
            {{ t("backoffice.statusConfirmed") }}
            <span class="legend-dot" style="background: #9ca3af"></span> {{ t("backoffice.statusCancelled") }}
          </div>
          <component
            :is="FullCalendar"
            v-if="FullCalendar"
            :options="calendarOptions"
          />
        </div>
      </div>
      <!-- ════════════ TAB VÉHICULES ════════════ -->
      <div v-else>
        <section class="form-section">
          <h2>
            {{ editingId ? t("backoffice.editVehicle") : t("backoffice.addVehicle") }}
          </h2>
          <form class="vehicle-form" @submit.prevent="handleSubmit">
            <!-- Upload Photo -->
            <div class="field">
              <label for="bo-photo">{{ t("backoffice.photoLabel") }}</label>
              <div class="file-drop" @click="fileInput.click()">
                <input
                  id="bo-photo"
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="onFileChange"
                  hidden
                />
                <img
                  v-if="photoPreview"
                  :src="photoPreview"
                  :alt="t('backoffice.photoPreviewAlt')"
                  class="photo-preview-img"
                />
                <div v-else class="file-placeholder">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <span>{{ t("backoffice.clickToAddPhoto") }}</span>
                </div>
              </div>
              <p v-if="photoError" class="form-error" role="alert">{{ photoError }}</p>
            </div>

            <div class="field-row">
              <div class="field">
                <label for="marque">{{ t("backoffice.brandLabel") }}</label>
                <input
                  id="marque"
                  v-model="form.marque"
                  type="text"
                  :placeholder="t('backoffice.brandPlaceholder')"
                  required
                />
              </div>
              <div class="field">
                <label for="modele">{{ t("backoffice.modelLabel") }}</label>
                <input
                  id="modele"
                  v-model="form.modele"
                  type="text"
                  :placeholder="t('backoffice.modelPlaceholder')"
                  required
                />
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label for="carburant">{{ t("backoffice.fuelLabel") }}</label>
                <select id="carburant" v-model="form.carburant" required>
                  <option value="" disabled>{{ t("backoffice.fuelSelectPlaceholder") }}</option>
                  <option value="Essence">{{ t("fuel.Essence") }}</option>
                  <option value="Diesel">{{ t("fuel.Diesel") }}</option>
                  <option value="Électrique">{{ t("fuel.Électrique") }}</option>
                  <option value="Hybride">{{ t("fuel.Hybride") }}</option>
                  <option value="Hybride rechargeable">{{ t("fuel.Hybride rechargeable") }}</option>
                  <option value="GPL">{{ t("fuel.GPL") }}</option>
                </select>
              </div>
              <div class="field">
                <label for="places">{{ t("backoffice.placesLabel") }}</label>
                <input
                  id="places"
                  v-model.number="form.places"
                  type="number"
                  min="1"
                  max="20"
                  :placeholder="t('backoffice.placesPlaceholder')"
                  required
                />
              </div>
              <div class="field">
                <label for="prix">{{ t("backoffice.priceLabel") }}</label>
                <input
                  id="prix"
                  v-model.number="form.prix"
                  type="number"
                  min="0"
                  step="1"
                  :placeholder="t('backoffice.pricePlaceholder')"
                  required
                />
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label for="lieu">{{ t("backoffice.locationLabel") }}</label>
                <select id="lieu" v-model="form.lieu" required>
                  <option value="" disabled>{{ t("backoffice.locationSelectPlaceholder") }}</option>
                  <option v-for="loc in locationStore.locations" :key="loc.id" :value="loc.nom">{{ loc.nom }}</option>
                </select>
              </div>
            </div>

            <div class="field tarifs-field">
              <div class="tarifs-header">
                <label>{{ t("backoffice.seasonalPricingLabel") }}</label>
                <button type="button" class="btn-add-tarif" @click="addTarifRow">
                  + {{ t("backoffice.addPeriod") }}
                </button>
              </div>
              <p class="tarifs-hint">{{ t("backoffice.seasonalPricingHint") }}</p>
              <div v-for="(tarif, i) in form.tarifs" :key="i" class="tarif-row">
                <input
                  type="date"
                  v-model="tarif.debut"
                  :aria-label="t('backoffice.periodStart')"
                  required
                />
                <span class="tarif-sep">→</span>
                <input
                  type="date"
                  v-model="tarif.fin"
                  :aria-label="t('backoffice.periodEnd')"
                  required
                />
                <input
                  type="number"
                  min="0"
                  step="1"
                  v-model.number="tarif.prix"
                  :placeholder="t('backoffice.pricePlaceholder')"
                  :aria-label="t('backoffice.periodPrice')"
                  required
                />
                <span class="tarif-currency">€</span>
                <button
                  type="button"
                  class="btn-remove-tarif"
                  @click="removeTarifRow(i)"
                  :aria-label="t('backoffice.removePeriod')"
                >
                  ×
                </button>
              </div>
            </div>

            <p v-if="vehicleFormError" class="form-error" role="alert">{{ vehicleFormError }}</p>

            <div class="form-actions">
              <button
                type="button"
                class="btn-cancel"
                v-if="editingId"
                @click="cancelEdit"
              >
                {{ t('searchBanner.cancel') }}
              </button>
              <button type="submit" class="btn-submit" :disabled="saving">
                <svg
                  v-if="saving"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="icon-spin"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <svg
                  v-else-if="editingId"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                  />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span v-if="saving">{{ t("backoffice.agencySaving") }}</span>
                <span v-else-if="editingId">{{ t("backoffice.updateBtn") }}</span>
                <span v-else>{{ t("backoffice.saveBtn") }}</span>
              </button>
            </div>
          </form>
        </section>

        <section class="list-section">
          <h2>
            {{ t("backoffice.vehiclesTitle") }}
            <span class="badge">{{ vehicles.length }}</span>
          </h2>
          <div v-if="vehicleStore.loading" class="empty-state">
            {{ t("backoffice.loading") }}
          </div>
          <div v-else-if="vehicles.length === 0" class="empty-state">
            {{ t("backoffice.noVehicles") }}
          </div>
          <div class="vehicles-table-wrapper" v-else>
            <table class="vehicles-table">
              <thead>
                <tr>
                  <th>{{ t("backoffice.colPhoto") }}</th>
                  <th>{{ t("backoffice.colBrandModel") }}</th>
                  <th>{{ t("backoffice.colFuel") }}</th>
                  <th>{{ t("backoffice.colSeats") }}</th>
                  <th>{{ t("backoffice.colPriceDay") }}</th>
                  <th>{{ t("backoffice.locationLabel") }}</th>
                  <th>{{ t("backoffice.colAvailability") }}</th>
                  <th>{{ t("backoffice.colActions") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in vehicles" :key="v.id">
                  <td>
                    <img
                      v-if="v.photoURL"
                      :src="cloudinaryThumb(v.photoURL, 160, 104)"
                      :alt="`${v.marque} ${v.modele}`"
                      class="table-thumb"
                      @error="(e) => e.target.style.visibility = 'hidden'"
                    />
                  </td>
                  <td>
                    <strong>{{ v.marque }}</strong>
                    <br /><span class="model-label">{{ v.modele }}</span>
                  </td>
                  <td>
                    <span class="tag" :class="fuelClass(v.carburant)">{{
                      t(`fuel.${v.carburant}`)
                    }}</span>
                  </td>
                  <td class="td-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="inline-icon"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {{ v.places }}
                  </td>
                  <td>
                    <strong>{{ v.prix ?? "—" }}€</strong>
                    <br v-if="v.tarifs?.length" />
                    <span v-if="v.tarifs?.length" class="tarifs-badge">
                      {{ t("backoffice.seasonalPricingCount", { count: v.tarifs.length }) }}
                    </span>
                  </td>
                  <td>{{ v.lieu ?? "—" }}</td>
                  <td class="td-center">
                    <button
                      :class="[
                        'btn-toggle',
                        v.disponible ? 'btn-toggle--on' : 'btn-toggle--off',
                      ]"
                      @click="vehicleStore.toggleDisponible(v.id, v.disponible)"
                    >
                      <svg
                        v-if="v.disponible"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="inline-icon"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <svg
                        v-else
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="inline-icon"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      {{ v.disponible ? t("backoffice.available") : t("fleet.unavailable") }}
                    </button>
                  </td>
                  <td class="actions td-center">
                    <button class="btn-edit" @click="editVehicle(v)">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="inline-icon"
                      >
                        <path
                          d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                        />
                        <path
                          d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                        />
                      </svg>
                      {{ t("backoffice.editBtn") }}
                    </button>
                    <button class="btn-delete" @click="deleteVehicle(v)">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="inline-icon"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path
                          d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                        />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                      {{ t("backoffice.deleteBtn") }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>

    <ReservationDetailModal
      v-if="detailReservation"
      :reservation="detailReservation"
      :visible="showDetailModal"
      @close="showDetailModal = false"
      @delete="handleDeleteReservation"
    />

    <!-- Confirmation de suppression véhicule -->
    <Teleport to="body">
      <div v-if="vehicleToDelete" class="delete-overlay" @click.self="vehicleToDelete = null">
        <div ref="deleteDialogRef" class="delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <h3 id="delete-dialog-title" class="delete-dialog-title">{{ t("backoffice.deleteBtn") }} — {{ t("backoffice.tabVehicles") }}</h3>
          <p class="delete-dialog-desc">{{ t("backoffice.deleteConfirm", { label: vehicleToDelete.label }) }}</p>
          <div class="delete-dialog-actions">
            <button class="btn-cancel-delete" @click="vehicleToDelete = null">{{ t("searchBanner.cancel") }}</button>
            <button class="btn-confirm-delete" @click="confirmDeleteVehicle">{{ t("backoffice.deleteBtn") }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, shallowRef, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { vehicleStore } from "../store/vehicles.js";
import { reservationStore } from "../store/reservations.js";
import { authStore } from "../store/auth.js";
import { formatDate } from "../composables/useFormatDate.js";
import { cloudinaryThumb } from "../utils/cloudinaryUtils.js";
import { hasOverlappingTarifs, calculateTotal, calcNbJours } from "../utils/pricing.js";
import ReservationDetailModal from "../components/ReservationDetailModal.vue";
import DateRangePicker from "../components/DateRangePicker.vue";
import { locationStore } from "../store/locations.js";
import { apiUrl } from "../utils/apiUrl.js";

const FullCalendar = shallowRef(null);
const dayGridPlugin = shallowRef(null);
const frLocale = shallowRef(null);

const { t, locale } = useI18n();

// Force un format 24h (lang="fr-FR"/"en-GB") : sur iOS, le widget natif
// affiche sinon un format AM/PM basé sur la locale de l'appareil, plus
// large, qui déborde du champ sur mobile.
const timeLang = computed(() => (locale.value === "fr" ? "fr-FR" : "en-GB"));

const activeTab = ref("reservations");
const reservations = computed(() => reservationStore.reservations);
const vehicles = computed(() => vehicleStore.vehicles);
const confirmedCount = computed(
  () => reservations.value.filter((r) => r.statut === "confirmee").length,
);
const cancelledCount = computed(
  () => reservations.value.filter((r) => r.statut === "annulee").length,
);

// Pagination réservations
const currentPage = ref(1);
const itemsPerPage = 10;
const totalPages = computed(() => Math.ceil(reservations.value.length / itemsPerPage));
const paginatedReservations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return reservations.value.slice(start, start + itemsPerPage);
});
watch(reservations, () => { currentPage.value = 1; });
watch(activeTab, (tab) => { if (tab !== 'reservations') showAgencyBooking.value = false; });

// — Formulaire véhicule
const editingId = ref(null);
const saving = ref(false);
const vehicleFormError = ref("");
const photoError = ref("");
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const photoFile = ref(null);
const fileInput = ref(null);
const emptyForm = () => ({
  marque: "",
  modele: "",
  carburant: "",
  places: "",
  prix: "",
  lieu: "",
  tarifs: [],
  photoURL: "",
});
const form = reactive(emptyForm());

function addTarifRow() {
  form.tarifs.push({ debut: "", fin: "", prix: "" });
}
function removeTarifRow(index) {
  form.tarifs.splice(index, 1);
}

const objectUrl = ref("");

watch(photoFile, (newFile) => {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value);
    objectUrl.value = "";
  }
  if (newFile) objectUrl.value = URL.createObjectURL(newFile);
});

onUnmounted(() => {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value);
  document.removeEventListener("keydown", handleDeleteKeydown);
});

const photoPreview = computed(() => objectUrl.value || form.photoURL || "");

function onFileChange(e) {
  const file = e.target.files[0] || null;
  if (file && file.size > MAX_PHOTO_SIZE) {
    photoError.value = t("backoffice.photoTooLarge");
    photoFile.value = null;
    e.target.value = "";
    return;
  }
  photoError.value = "";
  photoFile.value = file;
}

async function handleSubmit() {
  vehicleFormError.value = "";
  const invalidRange = form.tarifs.some(
    (t) => t.debut && t.fin && t.debut > t.fin,
  );
  if (invalidRange) {
    vehicleFormError.value = t("backoffice.tarifsRangeError");
    return;
  }
  if (hasOverlappingTarifs(form.tarifs)) {
    vehicleFormError.value = t("backoffice.tarifsOverlapError");
    return;
  }
  saving.value = true;
  try {
    if (editingId.value) {
      await vehicleStore.updateVehicle(editingId.value, { ...form }, photoFile.value);
    } else {
      await vehicleStore.addVehicle({ ...form }, photoFile.value);
    }
    cancelEdit();
  } catch (err) {
    console.error("[BackOffice] Erreur sauvegarde véhicule:", err);
    vehicleFormError.value = t("backoffice.saveError");
  } finally {
    saving.value = false;
  }
}

function editVehicle(vehicle) {
  editingId.value = vehicle.id;
  Object.assign(form, {
    marque: vehicle.marque,
    modele: vehicle.modele,
    carburant: vehicle.carburant,
    places: vehicle.places,
    prix: vehicle.prix ?? "",
    lieu: vehicle.lieu ?? "",
    tarifs: (vehicle.tarifs || []).map((t) => ({ ...t })),
    photoURL: vehicle.photoURL,
  });
  photoFile.value = null;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  editingId.value = null;
  Object.assign(form, emptyForm());
  photoFile.value = null;
  photoError.value = "";
  vehicleFormError.value = "";
  if (fileInput.value) fileInput.value.value = "";
}

const vehicleToDelete = ref(null);
const deleteDialogRef = ref(null);

function handleDeleteKeydown(e) {
  if (e.key === "Escape") vehicleToDelete.value = null;
}

watch(vehicleToDelete, (v) => {
  if (v) {
    document.addEventListener("keydown", handleDeleteKeydown);
    nextTick(() => deleteDialogRef.value?.querySelector("button")?.focus());
  } else {
    document.removeEventListener("keydown", handleDeleteKeydown);
  }
});

function deleteVehicle(vehicle) {
  vehicleToDelete.value = { id: vehicle.id, label: `${vehicle.marque} ${vehicle.modele}` };
}

async function confirmDeleteVehicle() {
  const { id } = vehicleToDelete.value;
  vehicleToDelete.value = null;
  await vehicleStore.deleteVehicle(id);
  if (editingId.value === id) cancelEdit();
}

function fuelClass(carburant) {
  const map = {
    Essence: "tag--orange",
    Diesel: "tag--gray",
    Électrique: "tag--green",
    Hybride: "tag--blue",
    "Hybride rechargeable": "tag--blue",
    GPL: "tag--purple",
  };
  return map[carburant] || "";
}

// — Réservation en agence
const showAgencyBooking = ref(false);
const agencyBookingSaving = ref(false);
const agencyBookingError = ref("");
const emptyAgencyForm = () => ({
  nom: "",
  email: "",
  telephone: "",
  vehicleId: "",
  location: "",
  startDate: "",
  startTime: "09:00",
  endDate: "",
  endTime: "18:00",
});
const agencyForm = reactive(emptyAgencyForm());

const availableVehicles = computed(() => {
  if (!agencyForm.location || !agencyForm.startDate || !agencyForm.endDate) return [];
  return vehicles.value.filter((v) => {
    if (!v.disponible || v.lieu !== agencyForm.location) return false;
    return !reservationStore.reservations.some(
      (r) =>
        r.vehicleId === v.id &&
        r.statut !== "annulee" &&
        agencyForm.startDate <= r.endDate &&
        agencyForm.endDate >= r.startDate,
    );
  });
});

watch(
  () => [agencyForm.location, agencyForm.startDate, agencyForm.endDate],
  () => { agencyForm.vehicleId = ""; },
);

async function handleAgencyBooking() {
  agencyBookingSaving.value = true;
  agencyBookingError.value = "";
  try {
    const vehicle = vehicles.value.find((v) => v.id === agencyForm.vehicleId);
    const vehicleLabel = vehicle ? `${vehicle.marque} ${vehicle.modele}` : "";
    const amount = vehicle
      ? calculateTotal(vehicle, agencyForm.startDate, calcNbJours(agencyForm.startDate, agencyForm.endDate, agencyForm.startTime, agencyForm.endTime))
      : undefined;
    const reservationId = await reservationStore.addReservation({
      vehicleId: agencyForm.vehicleId,
      vehicleLabel,
      vehiclePhoto: vehicle ? vehicle.photoURL || "" : "",
      nom: agencyForm.nom,
      email: agencyForm.email,
      telephone: agencyForm.telephone,
      location: agencyForm.location,
      startDate: agencyForm.startDate,
      startTime: agencyForm.startTime,
      endDate: agencyForm.endDate,
      endTime: agencyForm.endTime,
      userId: null,
      bookingSource: "agency",
      statut: "confirmee",
      amount,
    });

    // Best-effort: a failed confirmation email must not surface as a booking failure.
    // The endpoint re-reads the reservation (recipient + content) from Firestore itself —
    // it only needs reservationId plus an admin ID token to prove who's asking.
    authStore.user
      .getIdToken()
      .then((idToken) =>
        fetch(apiUrl("send-reservation-email"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ reservationId }),
        }),
      )
      .catch((err) => console.error("[BackOffice] Erreur envoi email confirmation:", err));

    Object.assign(agencyForm, emptyAgencyForm());
    showAgencyBooking.value = false;
  } catch (err) {
    console.error("[BackOffice] Erreur réservation agence:", err);
    agencyBookingError.value = err.code === "AVAILABILITY_ERROR"
      ? t("backoffice.vehicleUnavailable")
      : t("backoffice.agencyBookingError");
  } finally {
    agencyBookingSaving.value = false;
  }
}

// — Calendrier
const reservationsView = ref("list");

watch(
  reservationsView,
  async (view) => {
    if (view === "calendar" && !FullCalendar.value) {
      const [fc, dgp, loc] = await Promise.all([
        import("@fullcalendar/vue3"),
        import("@fullcalendar/daygrid"),
        import("@fullcalendar/core/locales/fr"),
      ]);
      dayGridPlugin.value = dgp.default;
      frLocale.value = loc.default;
      FullCalendar.value = fc.default;
    }
  },
  { immediate: true },
);
const detailReservation = ref(null);
const showDetailModal = ref(false);

function openDetail(r) {
  detailReservation.value = r;
  showDetailModal.value = true;
}

async function handleDeleteReservation(id) {
  await reservationStore.deleteReservation(id);
  showDetailModal.value = false;
  detailReservation.value = null;
}
const STATUS_COLORS = {
  confirmee: "#22c55e",
  annulee: "#9ca3af",
};
function addOneDay(d) {
  if (!d) return d;
  const dt = new Date(d);
  dt.setDate(dt.getDate() + 1);
  return dt.toISOString().split("T")[0];
}
const calendarEvents = computed(() =>
  reservationStore.reservations
    .filter((r) => r.startDate && r.endDate)
    .map((r) => ({
      title: `${r.vehicleLabel} — ${r.nom}`,
      start: r.startDate,
      end: addOneDay(r.endDate),
      backgroundColor: STATUS_COLORS[r.statut] ?? "#888",
      borderColor: STATUS_COLORS[r.statut] ?? "#888",
    })),
);
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin.value],
  initialView: "dayGridMonth",
  locale: frLocale.value,
  events: calendarEvents.value,
  eventDisplay: "block",
  height: "auto",
  headerToolbar: { left: "prev,next today", center: "title", right: "" },
}));
</script>

<style scoped>
.backoffice {
  padding: 3rem 0 5rem;
  background: var(--color-bg-page);
  min-height: 100vh;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-navy);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.page-title svg {
  width: 28px;
  height: 28px;
  color: var(--color-primary);
  flex-shrink: 0;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e8eaf6;
  padding-bottom: 0;
}
.tab {
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
}
.tab.active {
  color: var(--color-navy);
  border-bottom-color: var(--color-primary);
}
.tab-badge {
  background: var(--color-primary);
  color: #fff;
  border-radius: 20px;
  padding: 0.1rem 0.5rem;
  font-size: 0.75rem;
}
.tab svg,
.vt-btn svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Stats */
.stats-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.2rem 1.8rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
  flex: 1;
}
.stat-card--yellow {
  border-top: 3px solid #f9a825;
}
.stat-card--blue {
  border-top: 3px solid #3b82f6;
}
.stat-card--green {
  border-top: 3px solid #2e7d32;
}
.stat-card--red {
  border-top: 3px solid #c62828;
}
.stat-num {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-navy);
}
.stat-label {
  font-size: 0.85rem;
  color: #888;
}

/* Form */
.form-section {
  background: #fff;
  border-radius: 14px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
  margin-bottom: 2.5rem;
}
.form-section h2 {
  font-size: 1.2rem;
  color: var(--color-navy);
  margin-bottom: 1.5rem;
}
.vehicle-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  min-width: 0;
}
.field-row {
  display: flex;
  gap: 1rem;
}
@media (max-width: 560px) {
  .field-row {
    flex-direction: column;
  }
}
label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
}
input,
select {
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
  background: #fff;
}
input:focus,
select:focus {
  border-color: var(--color-primary);
}
input[type="time"] {
  -webkit-appearance: none;
  appearance: none;
  display: block;
  color: var(--color-navy);
}
input[type="time"]::-webkit-datetime-edit,
input[type="time"]::-webkit-datetime-edit-fields-wrapper,
input[type="time"]::-webkit-datetime-edit-text,
input[type="time"]::-webkit-datetime-edit-hour-field,
input[type="time"]::-webkit-datetime-edit-minute-field,
input[type="time"]::-webkit-datetime-edit-ampm-field {
  padding: 0;
}

/* Photo Upload */
.file-drop {
  border: 2px dashed #d0d4e8;
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}
.file-drop:hover {
  border-color: var(--color-primary);
}
.file-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #aaa;
  font-size: 0.9rem;
  padding: 2rem;
}
.file-placeholder svg {
  width: 40px;
  height: 40px;
  color: #aaa;
}
.photo-preview-img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
}

.tarifs-field {
  gap: 0.6rem;
}
.tarifs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tarifs-hint {
  font-size: 0.8rem;
  color: #888;
  margin: -0.2rem 0 0.2rem;
}
.btn-add-tarif {
  background: #e3f2fd;
  color: #1565c0;
  border: none;
  border-radius: 8px;
  padding: 0.35rem 0.7rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-add-tarif:hover {
  background: #bbdefb;
}
.tarif-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.tarif-row input[type="date"] {
  flex: 1;
}
.tarif-row input[type="number"] {
  width: 100px;
  flex: none;
}
.tarif-sep {
  color: #aaa;
  flex-shrink: 0;
}
.tarif-currency {
  color: #666;
  font-size: 0.9rem;
  flex-shrink: 0;
}
.btn-remove-tarif {
  background: #fce4ec;
  color: #c62828;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.btn-remove-tarif:hover {
  background: #f8bbd0;
}
.tarifs-badge {
  font-size: 0.75rem;
  color: #1565c0;
  background: #e3f2fd;
  border-radius: 10px;
  padding: 0.1rem 0.5rem;
  display: inline-block;
  margin-top: 0.2rem;
}

.form-error {
  background: #fce4ec;
  color: #c62828;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  font-size: 0.88rem;
  margin: 0;
}
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
.btn-submit {
  background: var(--color-navy);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-submit:hover:not(:disabled) {
  background: #2d2d4e;
}
.btn-submit svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.btn-submit:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}
.btn-cancel {
  background: #eee;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
}

/* List */
.list-section {
  background: #fff;
  border-radius: 14px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
}
.list-section h2 {
  font-size: 1.2rem;
  color: var(--color-navy);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.badge {
  background: var(--color-primary);
  color: #fff;
  border-radius: 20px;
  padding: 0.1rem 0.6rem;
  font-size: 0.85rem;
}
.empty-state {
  text-align: center;
  color: #999;
  padding: 2rem;
}
.vehicles-table-wrapper {
  overflow-x: auto;
}
.vehicles-table {
  width: 100%;
  border-collapse: collapse;
}
.vehicles-table th {
  text-align: left;
  padding: 0.9rem 1rem;
  font-size: 0.85rem;
  color: #888;
  background: var(--color-bg-page);
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 1;
}
.vehicles-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}
.table-thumb {
  width: 80px;
  height: 52px;
  object-fit: cover;
  border-radius: 6px;
}
.model-label {
  font-size: 0.82rem;
  color: #888;
}
.inline-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  vertical-align: middle;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.icon-spin {
  animation: spin 1s linear infinite;
}

/* Tags */
.tag {
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}
.tag--orange {
  background: #fff3e0;
  color: #e65100;
}
.tag--gray {
  background: #f5f5f5;
  color: #424242;
}
.tag--green {
  background: #e8f5e9;
  color: #2e7d32;
}
.tag--blue {
  background: #e3f2fd;
  color: #1565c0;
}
.tag--purple {
  background: #f3e5f5;
  color: #6a1b9a;
}

/* Disponible toggle */
.btn-toggle {
  border: none;
  border-radius: 20px;
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.btn-toggle--on {
  background: #e8f5e9;
  color: #2e7d32;
}
.btn-toggle--off {
  background: #fce4ec;
  color: #c62828;
}

.btn-edit,
.btn-delete {
  border: none;
  border-radius: 6px;
  padding: 0.35rem 0.7rem;
  font-size: 0.82rem;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.btn-edit {
  background: #e3f2fd;
  color: #1565c0;
}
.btn-edit:hover {
  background: #bbdefb;
}
.btn-delete {
  background: #fce4ec;
  color: #c62828;
}
.btn-delete:hover {
  background: #f8bbd0;
}

/* Reservations */
.date-col {
  font-size: 0.85rem;
  color: #888;
  white-space: nowrap;
}
.client-email {
  font-size: 0.82rem;
  color: #1565c0;
  text-decoration: none;
}
.client-phone {
  font-size: 0.82rem;
  color: #888;
}
.location-label {
  font-size: 0.82rem;
  font-weight: 600;
}
.date-range {
  font-size: 0.78rem;
  color: #888;
}
.row--confirmee {
  background: #f1f8f1;
}
.row--annulee {
  background: #fff5f5;
  opacity: 0.7;
}

.statut-select {
  border: none;
  border-radius: 20px;
  padding: 0.3rem 0.7rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  min-width: 110px;
}
.statut--confirmee {
  background: #e8f5e9;
  color: #2e7d32;
}
.th-center {
  text-align: center;
}
.td-center {
  text-align: center;
}
.btn-detail {
  background: #e8eaf6;
  color: var(--color-navy);
  border: none;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.btn-detail:hover {
  background: #c5c9e8;
}
.btn-detail svg {
  width: 16px;
  height: 16px;
}

.statut--annulee {
  background: #fce4ec;
  color: #c62828;
}

/* Réservation en agence */
.agency-booking {
  margin-bottom: 2rem;
  border-left: 4px solid var(--color-primary);
}
.agency-booking-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  font: inherit;
  color: inherit;
}
.agency-booking-toggle h2 {
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.agency-booking-toggle h2 svg {
  width: 18px;
  height: 18px;
  color: var(--color-primary);
  flex-shrink: 0;
}
.badge-agency {
  background: #fde8e8;
  color: var(--color-primary);
  border-radius: 20px;
  padding: 0.1rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}
.chevron {
  width: 20px;
  height: 20px;
  color: #888;
  transition: transform 0.2s;
  flex-shrink: 0;
}
.chevron.open {
  transform: rotate(180deg);
}
.agency-form {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f0f0f0;
}
.no-vehicles-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff8e1;
  color: #b45309;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
}
.no-vehicles-notice svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Vue toggle */
.view-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.vt-btn {
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.45rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.vt-btn.active {
  background: var(--color-navy);
  color: #fff;
  border-color: var(--color-navy);
}

/* Calendrier */
.calendar-wrapper {
  background: #fff;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.calendar-legend {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 1rem;
}
.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.3rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 0.5rem;
}
.btn-page {
  background: #f0f4ff;
  border: 1.5px solid #dde3f5;
  color: var(--color-navy);
  border-radius: 8px;
  padding: 0.45rem 1rem;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-page:hover:not(:disabled) { background: #e2e8fa; }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 0.88rem; color: #666; }

/* Delete confirmation dialog */
.delete-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 30, 0.5);
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.delete-dialog {
  background: #fff;
  border-radius: 14px;
  padding: 1.75rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.25);
}
.delete-dialog-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 0.5rem;
}
.delete-dialog-desc {
  font-size: 0.9rem;
  color: #555;
  margin: 0 0 1.5rem;
  line-height: 1.5;
}
.delete-dialog-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
.btn-cancel-delete {
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel-delete:hover {
  background: #e0e0e0;
}
.btn-confirm-delete {
  background: #c62828;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-confirm-delete:hover {
  background: #b71c1c;
}
</style>
