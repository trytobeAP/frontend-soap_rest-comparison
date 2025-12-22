<template>
  <v-card
    class="h-100"
    elevation="4"
    border
  >
    <!-- Шапка  -->
    <v-toolbar
      density="comfortable"
      :color="color"
    >
      <template v-slot:prepend>
        <v-icon
          :icon="icon || 'mdi-api'"
          class="ml-2"
        />
      </template>
      <v-toolbar-title class="font-weight-bold">{{ title }}</v-toolbar-title>
      <template v-slot:append>
        <v-chip
          class="font-weight-bold mr-2"
          color="white"
          variant="elevated"
          label
        >
          {{ protocol }}
        </v-chip>
      </template>
    </v-toolbar>

    <v-card-text class="pa-4">
      <!-- Блок управления -->
      <v-sheet
        class="pa-4 mb-4 bg-grey-lighten-5"
        rounded
        border
      >
        <div
          class="text-subtitle-2 mb-2 text-medium-emphasis text-uppercase font-weight-bold"
        >
          Действия
        </div>

        <v-btn
          class="mb-4"
          block
          size="large"
          variant="flat"
          prepend-icon="mdi-download"
          :loading="loading"
          :color="color"
          @click="loadData"
        >
          Загрузить список
        </v-btn>

        <v-row dense>
          <v-col cols="6">
            <v-text-field
              v-model="newStudent.name"
              label="Имя"
              density="compact"
              variant="outlined"
              hide-details
              bg-color="white"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="newStudent.specialization"
              label="Спец-ть"
              density="compact"
              variant="outlined"
              hide-details
              bg-color="white"
            />
          </v-col>
          <v-col cols="2">
            <v-btn
              block
              class="rounded"
              variant="elevated"
              color="success"
              height="40"
              :loading="loading"
              @click="createData"
            >
              <v-icon icon="mdi-plus" />
            </v-btn>
          </v-col>
        </v-row>
      </v-sheet>

      <div class="d-flex justify-space-between align-center mb-2">
        <h3 class="text-h6">Данные</h3>
        <v-badge
          color="grey-darken-1"
          inline
          :content="students.length"
        />
      </div>

      <v-sheet
        border
        rounded
        class="student-list-container mb-4 pa-2 bg-grey-lighten-5"
      >
        <div
          v-if="students.length === 0"
          class="text-center pa-4 text-grey"
        >
          Нет данных. Нажмите "Загрузить".
        </div>

        <v-list
          v-else
          bg-color="transparent"
          density="compact"
        >
          <!-- Карточка с рамкой для "студент" -->
          <v-list-item
            v-for="s in students"
            :key="s.id"
            class="mb-2 bg-white rounded border"
            elevation="1"
          >
            <template v-slot:prepend>
              <v-avatar
                color="grey-lighten-3"
                size="small"
              >
                <span class="text-subtitle-2 text-black">{{ s.course }}</span>
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-bold text-body-1 ml-2">
              {{ s.name }}
            </v-list-item-title>

            <v-list-item-subtitle class="ml-2 text-caption">
              {{ s.specialization }} (ID: {{ s.id }})
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-sheet>

      <v-divider class="my-4" />

      <!-- Метрики -->
      <h3 class="text-h6 mb-2">Метрики (Логи)</h3>
      <v-expansion-panels variant="popout">
        <v-expansion-panel
          v-for="(log, i) in logs"
          :key="i"
        >
          <v-expansion-panel-title
            :color="i === 0 ? 'green-lighten-5' : undefined"
          >
            <v-row
              no-gutters
              align="center"
            >
              <v-col
                cols="4"
                class="font-weight-bold text-caption text-uppercase"
              >
                {{ log.method }}
              </v-col>
              <v-col
                cols="4"
                class="text-caption"
              >
                <v-icon
                  icon="mdi-clock-outline"
                  size="small"
                  class="mr-1"
                />
                {{ log.duration.toFixed(2) }} ms
              </v-col>
              <v-col
                cols="4"
                class="text-caption text-right"
              >
                <v-icon
                  icon="mdi-weight"
                  size="small"
                  class="mr-1"
                />
                {{ log.dataSize }} B
              </v-col>
            </v-row>
          </v-expansion-panel-title>
          <v-expansion-panel-text class="bg-grey-darken-4 text-green-accent-3">
            <div class="d-flex justify-space-between mb-2 border-b pb-1">
              <span>Raw Response Preview:</span>
              <v-icon
                icon="mdi-code-tags"
                size="small"
              />
            </div>
            <pre class="code-preview">{{ log.rawResponse }}</pre>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Student, RequestMetrics } from "@/types/student";

const props = defineProps<{
  title: string;
  color: string;
  protocol: "REST" | "SOAP";
  icon?: string;
  fetchAction: () => Promise<{ data: any; metrics: RequestMetrics }>;
  createAction: (s: any) => Promise<{ data: any; metrics: RequestMetrics }>;
}>();

const students = ref<Student[]>([]);
const loading = ref(false);
const logs = ref<RequestMetrics[]>([]);

const newStudent = ref({
  name: "New Student",
  specialization: "IT",
  course: 1,
});

const loadData = async () => {
  loading.value = true;
  try {
    const res = await props.fetchAction();
    students.value = res.data;
    logs.value.unshift(res.metrics);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const createData = async () => {
  loading.value = true;
  try {
    const res = await props.createAction({ ...newStudent.value });
    logs.value.unshift(res.metrics);
    await loadData();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.student-list-container {
  max-height: 250px;
  overflow-y: auto;
}

.code-preview {
  font-family: "Consolas", "Monaco", monospace;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}
</style>
