/////////////
// Example //
/////////////

// Function declared in Javascript
void print(char* msg);
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
	// Not implemented yet
}

// Function to be called from Javascript
int add(int a, int b)
{
	print("In C add()\n");
	return a + b;
}

int sum(int a[], int len)
{
	print("In C sum()\n");
  	int sum = 0;
  	for (int i = 0; i < len; i++)
	{
    	sum += a[i];
	}

	return sum;
}

float square_root(float number)
{
	print("In C square_root()\n");
	return sqrt(number);
}

#define MAX_MSG_LENGTH	100

char* reverse(char* msg, int len)
{
	print(msg);
	char* result = c_malloc(len + 1);
	result[len] = 0;
	for (int i = 0; i < len; ++i)
	{
		result[len - 1 - i] = msg[i];
	}

	return result;
}
