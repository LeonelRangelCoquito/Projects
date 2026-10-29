const form = document.querySelector('#registration-form');
const formMessage = document.querySelector('#form-message');
const successPanel = document.querySelector('#success-panel');
const submitButton = form.querySelector('button[type="submit"]');
const phoneInput = document.querySelector('#phone');

function setCampaignLink(element, url, label) {
  if (!url) {
    element.removeAttribute('href');
    element.setAttribute('aria-disabled', 'true');
    element.setAttribute('tabindex', '-1');
    element.classList.add('is-disabled');
    element.textContent = `${label} (em breve)`;
    return;
  }

  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('URL inválida');
    element.href = parsedUrl.href;
  } catch {
    element.removeAttribute('href');
    element.setAttribute('aria-disabled', 'true');
    element.setAttribute('tabindex', '-1');
    element.classList.add('is-disabled');
    element.textContent = `${label} (em breve)`;
  }
}

async function loadCampaignConfig() {
  const response = await fetch('/api/config');
  if (!response.ok) return;
  const config = await response.json();
  document.querySelector('#event-date').textContent = config.raffleDate;
  setCampaignLink(document.querySelector('#instagram-link'), config.instagramUrl, 'Abrir Instagram ↗');
  setCampaignLink(document.querySelector('#google-link'), config.googleReviewUrl, 'Avaliar no Google ↗');
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

phoneInput.addEventListener('input', () => {
  phoneInput.value = formatPhone(phoneInput.value);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formMessage.hidden = true;
  formMessage.textContent = '';

  const formData = new FormData(form);
  const payload = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    followsInstagram: formData.get('followsInstagram') === 'on',
    reviewedGoogle: formData.get('reviewedGoogle') === 'on',
  };

  submitButton.disabled = true;
  submitButton.querySelector('span:first-child').textContent = 'Enviando...';

  try {
    const response = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      formMessage.textContent = result.error || 'Não foi possível concluir o cadastro.';
      formMessage.classList.add('is-error');
      formMessage.hidden = false;
      return;
    }

    document.querySelector('#participant-id').textContent = result.id;
    form.hidden = true;
    successPanel.hidden = false;
    successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch {
    formMessage.textContent = 'Falha de conexão. Confira sua internet e tente novamente.';
    formMessage.classList.add('is-error');
    formMessage.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector('span:first-child').textContent = 'Quero participar';
  }
});

document.querySelector('#copy-id').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  const id = document.querySelector('#participant-id').textContent;
  try {
    await navigator.clipboard.writeText(id);
    button.textContent = 'Copiado!';
    window.setTimeout(() => { button.textContent = 'Copiar ID'; }, 1800);
  } catch {
    button.textContent = id;
  }
});

loadCampaignConfig().catch(() => {
  setCampaignLink(document.querySelector('#instagram-link'), '', 'Abrir Instagram ↗');
  setCampaignLink(document.querySelector('#google-link'), '', 'Avaliar no Google ↗');
});
