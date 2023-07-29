////////////
// Example
////////////

// Function declared in Javascript
void console(char* msg);
float sqrt(float number);

// Our memory allocator
extern unsigned char __heap_base;
unsigned char* bump_pointer = &__heap_base;

void* c_malloc(int n)
{
	unsigned char* r = bump_pointer;
	bump_pointer += n;
	return (void *)r;
}

void c_free(void* p)
{
	// nop
}

// Function to be called from Javascript
int add(int a, int b)
{
	console("In C add()\n");
	return a + b;
}

int sum(int a[], int len)
{
	console("In C sum()\n");
  	int sum = 0;
  	for (int i = 0; i < len; i++)
	{
    	sum += a[i];
	}

	return sum;
}

float square_root(float number)
{
	console("In C square_root()\n");
	return sqrt(number);
}
