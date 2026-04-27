export let AppDB = {
    weeklyTasks: {},
    timetable: []
};

export function dbSave() {
    localStorage.setItem('sfe_app_data', JSON.stringify(AppDB));
}

export function dbSaveImmediate() {
    dbSave();
}

export function dbLoad() {
    try {
        const raw = localStorage.getItem('sfe_app_data');
        if (raw) {
            const saved = JSON.parse(raw);
            AppDB.weeklyTasks = saved.weeklyTasks || {};
            AppDB.timetable = saved.timetable || [];
        }
    } catch (e) {
        console.error("Failed to load AppDB", e);
    }
}

dbLoad();
