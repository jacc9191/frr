
 const firebaseConfig = {
  apiKey: "AIzaSyBV8-3IEMPuP0C9mlt5n4NsZe1z3TKuvy4",
  authDomain: "modaestiloco.firebaseapp.com",
  projectId: "modaestiloco",
  storageBucket: "modaestiloco.firebasestorage.app",
  messagingSenderId: "136442859187",
  appId: "1:136442859187:web:9768e10060f45a9543eac6",
  measurementId: "G-6PZM6CND29"
};
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    function loginFirebase() {
      const correo = document.getElementById("correo").value;
      const clave = document.getElementById("clave").value;

      auth.signInWithEmailAndPassword(correo, clave)
        .then(() => {
          document.getElementById("login").style.display = "none";
          document.getElementById("admin").style.display = "block";
          cargarProductos();
          cargarConfiguracion();
          cargarMetodosPago(); // ✅ Agrega esta línea aquí
          cargarTextoQuienesSomos();
         mostrarVistaPreviaGaleria();

        })
        .catch(err => {
          alert("❌ Error: " + err.message);
        });
    }

    function toggleConfiguracionFooter() {
      const seccion = document.getElementById("configuracion-footer");
      const btn = document.getElementById("btnToggleConfigFooter");

      const estaVisible = seccion.style.display !== "none";

      seccion.style.display = estaVisible ? "none" : "block";
      btn.textContent = estaVisible ? "⚙️ Mostrar configuración" : "🔽 Ocultar configuración";
    }

    function toggleAgregarProducto() {
      const form = document.getElementById("formAgregarProducto");
      const btn = document.getElementById("btnToggleAgregarProducto");
      const estaVisible = form.style.display !== "none";

      form.style.display = estaVisible ? "none" : "block";
      btn.textContent = estaVisible ? "➕ Mostrar formulario de producto" : "🔽 Ocultar formulario de producto";
    }

    function actualizarPreview() {
  const valor = document.getElementById('nuevoImagenes').value.trim();
  const preview = document.getElementById('preview');

  // Extrae el primer URL de imagen válido (esperando formato: color|url)
  const partes = valor.split(',');
  if (partes.length > 0) {
    const primera = partes[0].split('|')[1]?.trim();
    if (primera && primera.startsWith('http')) {
      preview.src = primera;
      return;
    }
  }

  preview.src = ''; // Limpia si no hay imagen válida
}


    function mostrarSeccion(id) {
  const seccion = document.getElementById("seccion-" + id);

  if (seccion.classList.contains("activa")) {
    // Si ya está visible, la ocultamos
    seccion.classList.remove("activa");
  } else {
    // Si no está visible, primero ocultamos las demás y luego mostramos esta
    document.querySelectorAll('.seccion').forEach(div => div.classList.remove('activa'));
    seccion.classList.add("activa");
  }
}


function agregarProducto() {
  const nombre = document.getElementById("nuevoNombre").value.trim();
  const precio = parseInt(document.getElementById("nuevoPrecio").value);
  const precioOriginal = parseInt(document.getElementById("nuevoPrecioOriginal").value);
  const imagenInput = document.getElementById("nuevoImagenes").value.trim();
  const color = document.getElementById("nuevoColor").value.trim().toLowerCase();
  const tallas = document.getElementById("nuevoTallas").value
    .split(',')
    .map(t => t.trim())
    .filter(t => t !== "");

 const descripcion = document.getElementById("nuevoDescripcion").value.trim(); // 👈 aquí
 
  // Validaciones
  if (!nombre || isNaN(precio) || isNaN(precioOriginal) || !imagenInput || !color || tallas.length === 0) {
    alert("❌ Por favor completa todos los campos correctamente.");
    return;
  }

  // Procesar imágenes (esperando formato: rojo|URL, azul|URL)
  const imagenes = {};
  const entradas = imagenInput.split(",");
  let imagenPrincipal = "";

  for (const par of entradas) {
    const [c, url] = par.split("|").map(s => s.trim().toLowerCase());
    if (c && url && url.startsWith("http")) {
      imagenes[c] = url;
      if (c === color) imagenPrincipal = url;
    }
  }

  if (!imagenPrincipal) {
    alert("❌ El color principal no tiene una imagen válida asociada.");
    return;
  }

if (!descripcion) {
  alert("❌ Por favor agrega una descripción."); // 👈 aquí
  return;
}


  const data = {
    nombre,
    precio,
    precioOriginal,
    imagen: imagenPrincipal,
    color,
    tallas,
    imagenes,
    descripcion // 👈 aquí
  };

  db.collection("productos").add(data)
    .then(() => {
      alert("✅ Producto agregado correctamente.");
      document.getElementById("nuevoNombre").value = "";
      document.getElementById("nuevoPrecio").value = "";
      document.getElementById("nuevoPrecioOriginal").value = "";
      document.getElementById("nuevoImagenes").value = "";
      document.getElementById("nuevoColor").value = "";
      document.getElementById("nuevoTallas").value = "";
      document.getElementById("nuevoDescripcion").value = ""; // 👈 aquí

      document.getElementById("preview").src = "";
    })
    .catch(err => {
      console.error("❌ Error al agregar producto:", err);
      alert("❌ Ocurrió un error al guardar el producto.");
    });
}


    function eliminarProducto(id) {
      if (confirm("¿Eliminar este producto?")) {
        db.collection("productos").doc(id).delete()
          .then(() => alert("✅ Producto eliminado."))
          .catch(err => alert("❌ Error al eliminar: " + err.message));
      }
    }

    function cargarProductos() {
      db.collection("productos").onSnapshot(snapshot => {
        const contenedor = document.getElementById("productos");
        contenedor.innerHTML = "";

        snapshot.forEach(doc => {
          const p = doc.data();
          const div = document.createElement("div");
          div.className = "producto-item";
         div.innerHTML = `
  <strong>${p.nombre}</strong><br>
  💰 Precio: $${p.precio.toLocaleString()} - <s>$${p.precioOriginal.toLocaleString()}</s><br>
  
  <p style="font-size: 14px; margin: 5px 0;">📝 ${p.descripcion || "Sin descripción"}</p>

  <div style="display: flex; gap: 8px; overflow-x: auto; white-space: nowrap; padding: 5px 0;">
    🎨 ${Object.keys(p.imagenes).map(color =>
      `<div style="display: inline-block; text-align: center;">
        <img src="${p.imagenes[color]}" alt="${color}" style="height: 50px; border-radius: 6px;"><br>
        <span style="font-size: 12px;">${color}</span>
      </div>`).join('')}
  </div>

  <div style="display: flex; gap: 8px; overflow-x: auto; white-space: nowrap; padding: 5px 0;">
    📏 ${p.tallas.map(t => `
      <span style="display: inline-block; background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 14px;">
        ${t}
      </span>`).join('')}
  </div>

  <div class="acciones">
    <button class="btn-rojo" onclick="eliminarProducto('${doc.id}')">❌ Eliminar</button>
  </div>
`;
          contenedor.appendChild(div);
        });
      });
    }

    function guardarConfiguracion() {
      const config = {
        whatsapp: document.getElementById("configWhatsapp").value.trim(),
        whatsappPedidos: document.getElementById("configWspPedido").value.trim(),
        facebook: document.getElementById("configFacebook").value.trim(),
        instagram: document.getElementById("configInstagram").value.trim(),
        tiktok: document.getElementById("configTikTok").value.trim()
      };

      db.collection("configuracion").doc("footer").set(config)
        .then(() => {
          alert("✅ Configuración guardada correctamente.");
        })
        .catch(err => {
          console.error("Error al guardar configuración:", err);
          alert("❌ No se pudo guardar la configuración.");
        });
    }

    function cargarConfiguracion() {
      db.collection("configuracion").doc("footer").get()
        .then(doc => {
          if (doc.exists) {
            const c = doc.data();
            document.getElementById("configWhatsapp").value = c.whatsapp || "";
            document.getElementById("configWspPedido").value = c.whatsappPedidos || "";
            document.getElementById("configFacebook").value = c.facebook || "";
            document.getElementById("configInstagram").value = c.instagram || "";
            document.getElementById("configTikTok").value = c.tiktok || "";
          }
        })
        .catch(err => {
          console.warn("⚠️ No se pudo cargar la configuración:", err);
        });
    }

    function guardarMetodoPago() {
  const nombre = document.getElementById('nombreBanco').value.trim();
  const cuenta = document.getElementById('numeroCuenta').value.trim();

  if (!nombre || !cuenta) {
    alert("Completa ambos campos para guardar el método.");
    return;
  }

  db.collection("metodosPago").add({
    nombre,
    cuenta
  }).then(() => {
    document.getElementById('nombreBanco').value = "";
    document.getElementById('numeroCuenta').value = "";
    cargarMetodosPago(); // Recargar lista
  });
}

function cargarMetodosPago() {
  const lista = document.getElementById('listaMetodosPago');
  lista.innerHTML = "";

  db.collection("metodosPago").onSnapshot(snapshot => {
    lista.innerHTML = "";
    snapshot.forEach(doc => {
      const metodo = doc.data();
      const li = document.createElement("li");
      li.textContent = `${metodo.nombre} - ${metodo.cuenta}`;

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "❌";
      btnEliminar.onclick = () => eliminarMetodoPago(doc.id);

      li.appendChild(btnEliminar);
      lista.appendChild(li);
    });
  });
}

function eliminarMetodoPago(id) {
  if (confirm("¿Eliminar este método de pago?")) {
    db.collection("metodosPago").doc(id).delete();
  }
}
function guardarQuienesSomos() {
  const texto = document.getElementById("quienesSomosTexto").value.trim();

  db.collection("contenido").doc("quienesSomos").set({ texto })
    .then(() => {
      alert("✅ Texto actualizado con éxito.");
    })
    .catch(error => {
      console.error("❌ Error al guardar texto:", error);
      alert("Ocurrió un error al guardar.");
    });
}

function cargarTextoQuienesSomos() {
  const campo = document.getElementById("quienesSomosTexto");
  if (!campo) return;

  db.collection("contenido").doc("quienesSomos").get()
    .then(doc => {
      if (doc.exists) {
        campo.value = doc.data().texto || "";
      } else {
        campo.value = "";
      }
    })
    .catch(error => {
      console.error("Error al cargar texto 'Quiénes somos':", error);
    });
}

async function guardarGaleriaPorLinks() {
  try {
    const descripcion = document.getElementById("inputDescripcion").value.trim();
    const links = document.getElementById("inputLinks").value
                    .split("\n")
                    .map(l => l.trim())
                    .filter(l => l !== "");

    console.log("👤 Usuario actual:", firebase.auth().currentUser);
    console.log("📝 Descripción:", descripcion);
    console.log("🔗 Links:", links);

    if (links.length === 0) {
      alert("⚠️ Debes ingresar al menos un enlace de imagen.");
      return;
    }

    // 🔧 Guardar en Firestore
    await db.collection("galeria").doc("principal").set({
      descripcion,
      imagenes: links
    });

    console.log("✅ Documento guardado en galeria/principal");
    document.getElementById("estadoSubida").textContent = "✅ Galería guardada correctamente.";
    mostrarVistaPreviaGaleria();

  } catch (err) {
    console.error("🔥 Error al guardar galería:", err);
    alert(`❌ Error: ${err.message}`);
  }
}


function mostrarVistaPreviaGaleria() {
  db.collection("galeria").doc("principal").get()
    .then(doc => {
      if (!doc.exists) {
        document.getElementById("vistaGaleria").innerHTML = "<p>❌ No hay galería guardada.</p>";
        return;
      }

      const data = doc.data();
      const html = `
        <h3>📷 Vista previa de la galería</h3>
        <p>${data.descripcion || "Sin descripción"}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
          ${data.imagenes.map(url => `
            <img src="${url}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
          `).join('')}
        </div>
      `;
      document.getElementById("vistaGaleria").innerHTML = html;
    })
    .catch(err => {
      console.error("❌ Error al cargar galería:", err);
      document.getElementById("vistaGaleria").innerHTML = "<p>❌ Error al cargar la galería.</p>";
    });
}

window.addEventListener("error", function(e) {
  console.error("🛑 Error global detectado:", e.message);
});
