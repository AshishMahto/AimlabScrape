var benchmarks = [
  {
    id: "CsLevel.Lowgravity56.VT%x%WHJ.RWEZ9J",
    label: "VT x WHJ Smooth Strafe Sphere",
    accuracy: "redundant",
  },
  {
    id: "CsLevel.Lowgravity56.VT%Adjus.ROJETY",
    label: "VT Adjust Track VALORANT",
    accuracy: "redundant",
  },
  {
    id: "CsLevel.Lowgravity56.VT%3T%Wi.RTA5MX",
    label: "VT 3T Wide ",
    accuracy: 91,
  },
  {
    id: "CsLevel.Lowgravity56.VT%Berry.RUPUHP",
    label: "VT BerryTS Static Small",
    accuracy: 93,
  },
  {
    id: "CsLevel.Lowgravity56.VT%x%WHJ.RWFB5F",
    label: "VT x WHJ 5 Sphere Hipfire Small",
  },
  {
    id: "CsLevel.VT%Empyrean.VT%1w2ts.R21FUT",
    label: "VT 1w2ts Smallflicks Valorant",
    accuracy: 94,
  },
  {
    id: "CsLevel.Lowgravity56.VT%Dynam.RQCD1Z",
    label: "VT Dynamic Reflex Micro",
  },
  {
    id: "CsLevel.Lowgravity56.VT%x%WHJ.RWFQU4",
    label: "VT x WHJ Speedswitch Click",
  },
];

const taskList = /** @type {HTMLUListElement} */ (document.getElementById("task-list"));
taskList.innerHTML = benchmarks.map(({ id, label }) => `<option value="${id}">${label}</option>`).join("");
