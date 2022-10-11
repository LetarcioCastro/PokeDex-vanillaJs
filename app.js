
const efect3D = (() => {

	const percent = 25
	const calcRotate = (poss, size) => (poss / (size / 2)) * percent - percent

	const addEfect3D = element => {

		let height = element.clientHeight
		let width = element.clientWidth

		element.addEventListener('mouseover', () => {
			height = element.clientHeight
			width = element.clientWidth
		})

		let count = 0
		element.addEventListener('mousemove', ({ offsetX, offsetY }) => {
			count++
			if (count % 10 !== 0) return
			element.style.setProperty('--x', `${calcRotate(offsetX, width)}deg`)
			element.style.setProperty('--y', `${calcRotate(offsetY, height) * -1}deg`)
		})
	}

	return addEfect3D
})()

const createTypeSpan = type => {
	const span = document.createElement('span')
	span.classList.add(type)
	span.innerText = type
	return span
}

const modalApp = (() => {

	const modal = document.createElement('div')
	const windowModal = document.createElement('div')
	const img = document.createElement('div')
	const head = document.createElement('div')
	const title = document.createElement('h1')
	const closeIcon = document.createElement('i')
	const content = document.createElement('div')
	const type = document.createElement('div')
	const weaknesse = document.createElement('div')
	const abilitie = document.createElement('div')

	modal.classList.add('modal')
	windowModal.classList.add('window')
	img.classList.add('img')
	head.classList.add('head')
	closeIcon.className = 'bx bx-x'
	content.classList.add('content')

	document.body.appendChild(modal)
	modal.appendChild(windowModal)
	windowModal.appendChild(img)
	windowModal.appendChild(head)
	windowModal.appendChild(content)
	windowModal.appendChild(closeIcon)
	head.appendChild(title)
	content.appendChild(type)
	content.appendChild(abilitie)
	// content.appendChild(abilitie)


	const close = () => {
		document.body.removeAttribute('modalOpen')
		modal.removeAttribute('open')
	}
	const open = () => {
		document.body.setAttribute('modalOpen', '')
		modal.setAttribute('open', '')
	}

	closeIcon.onclick = () => close()
	windowModal.onclick = e => e.stopPropagation()
	modal.onclick = () => close()

	const setTitle = name => title.innerText = name

	const setTypes = types => {
		type.innerHTML = '<h2>Type</h1>'
		types.forEach(typeValue =>
			type.appendChild(createTypeSpan(typeValue)))
	}

	const setWeaknesses = weaknesses => {
		weaknesse.innerHTML = '<h2>Weaknesse</h2>'
		weaknesses.forEach(typeValue =>
			type.appendChild(createTypeSpan(typeValue)))
	}

	const setAblites = Abilities => {
		abilitie.innerHTML = '<h2>Abilities</h2>'
		abilitie.append(Abilities.join(' | '))
	}
	const setImg = imgPokemo => {
		img.innerHTML = ''
		img.appendChild(imgPokemo.cloneNode())
	}

	const setAttrs = ({ name, types, abilities, img }) => {
		setTitle(name)
		setTypes(types)
		setImg(img)
		// setWeaknesses(weaknesses)
		setAblites(abilities)
	}

	return {
		open,
		close,
		setAttrs,
	}

})()


const pokedexAPI = (async () => {

	const limit = 80
	let countPage = 0
	const getNextUrl = () =>
		`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${limit * (countPage++)}`

	const $pokedex = document.querySelector('.pokedex')

	const pokemoHtmlConstructor = ({ id, name, types, imgUrl }) => {

		const $pokemo = document.createElement('div')
		const h1 = document.createElement('h1')
		const div = document.createElement('div')
		const imgContent = document.createElement('div')
		const circle = document.createElement('circle')
		const img = document.createElement('img')

		$pokemo.imgPokemo = img
		imgContent.classList.add('imgContent')
		h1.innerText = `${id}. ${name}`
		circle.classList.add(types[0])
		img.setAttribute('src', imgUrl)

		types.forEach(type => {
			const span = createTypeSpan(type)
			div.appendChild(span)
		})

		$pokemo.appendChild(imgContent)
		imgContent.appendChild(img)
		imgContent.appendChild(circle)
		$pokemo.appendChild(h1)
		$pokemo.appendChild(div)
		$pokedex.appendChild($pokemo)

		efect3D($pokemo)

		return $pokemo
	}

	const time = () => new Promise(response => setTimeout(() => response(), 2000))

	const pokemoConstructor = async url => {

		let {
			name,
			id,
			types,
			abilities,
			sprites
		} = await fetch(url).then(response => response.json())

		types = types.map(({ type }) => type.name)
		abilities = abilities.map(({ ability }) => ability.name)
		const imgUrl = sprites.other['official-artwork'].front_default
		const $pokemo = pokemoHtmlConstructor({ id, name, types, imgUrl })

		$pokemo.onclick = () => {
			modalApp.setAttrs({ name, abilities, types, img: $pokemo.imgPokemo })
			modalApp.open()
		}

		return {
			element: $pokemo,
			data: {
				name: `${id}. ${name}`,
				types,
				abilities,
			},
			img: $pokemo.imgPokemo
		}

	}

	const morePokemos = (() => {

		const conteiner = document.createElement('div')
		const button = document.createElement('button')

		conteiner.classList.add('nextPokemos')
		button.innerText = 'More pokemos'

		conteiner.appendChild(button)

		document.body.appendChild(conteiner)

		button.onclick = () => pokedexConstructor(getNextUrl())

		const open = () => conteiner.setAttribute('open', '')
		const close = () => conteiner.removeAttribute('open')

		return {
			open,
			close,
		}

	})()

	const load = (() => {

		const loadContent = document.createElement('div')

		loadContent.innerHTML =
			`<svg class="spinner" viewBox="0 0 50 50">
 			 <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5">
			 </circle>
			</svg>`

		loadContent.classList.add('loaderConteiner')
		document.body.appendChild(loadContent)

		const on = () => loadContent.setAttribute('open', '')
		const off = () => loadContent.removeAttribute('open')

		return {
			on,
			off,
		}

	})()

	const pokedex = []

	const pokedexConstructor = async url => {
		morePokemos.close()
		load.on()
		const { results } = await fetch(url).then(response => response.json())
		for (let index in results) {
			let result = await pokemoConstructor(results[index].url)
			pokedex.push(result)
		}
		morePokemos.open()
		load.off()
		return results
	}

	pokedexConstructor(getNextUrl())

	const seachApp = (() => {
		const inputSeach = document.querySelector('#seachPokedex')

		const seachAttrs = (seach, { name, types, abilities }) => {
			if (name.includes(seach)) return true
			for (let value of types) if (value.includes(seach)) return true
			for (let value of abilities) if (value.includes(seach)) return true
			return false
		}

		const seach = seach =>
			pokedex.forEach(({ element, data }) =>
				seachAttrs(seach, data)
					? element.removeAttribute('hide')
					: element.setAttribute('hide', ''))


		inputSeach.addEventListener('keyup', () => seach(inputSeach.value))

	})()

















})()
